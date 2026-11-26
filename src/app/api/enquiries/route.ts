// OWNER: Mike. Working first version of the contract in src/types/contracts.ts.
import { NextResponse } from "next/server";
import { forms, validate, type FormKind } from "@/lib/forms";
import { normalisePhone } from "@/lib/phone";
import { getTripBySlug, spotsLeft } from "@/lib/trips";
import { createEnquiry, needsPayment } from "@/lib/enquiries";
import { notifyEnquiryReceived } from "@/lib/notify";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";

const reply = (body: EnquiryResponse, status: number) => NextResponse.json(body, { status });

// In-memory rate limit: 5 submissions per IP per minute. Per-instance only (no shared store) —
// fine at this scale; move to Redis/Upstash if traffic grows enough to span many instances.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
  }
  return recent.length > RATE_LIMIT;
}

const MAX_BODY_BYTES = 50_000;
const MAX_FIELDS = 60;
const MAX_FIELD_LENGTH = 3000; // matches validate()'s own per-field cap in forms.ts

export async function POST(req: Request) {
  if (isRateLimited(clientIp(req))) {
    return reply({ ok: false, errors: {}, message: "Too many requests. Please try again in a minute." }, 429);
  }
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return reply({ ok: false, errors: {}, message: "Request too large" }, 400);
  }

  let body: EnquiryRequest;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, errors: {}, message: "Invalid request" }, 400);
  }
  if (!body?.kind || !(body.kind in forms)) return reply({ ok: false, errors: {}, message: "Unknown form" }, 400);
  if (body.website_url) return reply({ ok: false, errors: {}, message: "Invalid request" }, 400); // honeypot

  const rawValues = body.values ?? {};
  if (typeof rawValues !== "object" || Array.isArray(rawValues)) {
    return reply({ ok: false, errors: {}, message: "Invalid request" }, 400);
  }
  const entries = Object.entries(rawValues);
  if (entries.length > MAX_FIELDS) return reply({ ok: false, errors: {}, message: "Invalid request" }, 400);
  for (const [, v] of entries) {
    const tooLong = Array.isArray(v)
      ? v.some((item) => String(item).length > MAX_FIELD_LENGTH)
      : String(v ?? "").length > MAX_FIELD_LENGTH;
    if (tooLong) return reply({ ok: false, errors: {}, message: "One of your answers is too long" }, 400);
  }

  const kind = body.kind as FormKind;
  const { values, errors } = validate(kind, rawValues);
  const phone = normalisePhone(String(values.phone ?? ""));
  if (values.phone && !phone) errors.phone = "Enter a valid phone number, e.g. 0712 345 678 or +44 7700 900123";

  let tripId: string | undefined;
  if (kind === "reservation") {
    const trip = body.tripSlug ? await getTripBySlug(body.tripSlug) : null;
    if (!trip) return reply({ ok: false, errors, message: "This trip is no longer available" }, 422);
    const left = await spotsLeft(trip.id);
    if (Number(values.spots) > left) errors.spots = left ? `Only ${left} spot(s) left` : "This trip is fully booked";
    tripId = trip.id;
  }
  if (Object.keys(errors).length) return reply({ ok: false, errors, message: "Please check the highlighted fields" }, 422);

  const enquiry = await createEnquiry({ kind, values, phone: phone!, tripId });
  await notifyEnquiryReceived(enquiry.id).catch((e) => console.error("[notify] failed", e));

  const pay = needsPayment(kind);
  return reply(
    {
      ok: true,
      reference: enquiry.reference,
      next: pay ? "pay" : "done",
      redirectTo: pay ? `/pay/${enquiry.reference}` : `/thank-you?ref=${enquiry.reference}`,
    },
    201,
  );
}
