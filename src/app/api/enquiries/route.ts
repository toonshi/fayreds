// OWNER: Mike. Working first version of the contract in src/types/contracts.ts.
// TODO(Mike): rate limiting per IP, stricter spam checks.
import { NextResponse } from "next/server";
import { forms, validate, type FormKind } from "@/lib/forms";
import { normalisePhone } from "@/lib/phone";
import { getTripBySlug, spotsLeft } from "@/lib/trips";
import { createEnquiry, needsPayment } from "@/lib/enquiries";
import { notifyEnquiryReceived } from "@/lib/notify";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";

const reply = (body: EnquiryResponse, status: number) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  let body: EnquiryRequest;
  try {
    body = await req.json();
  } catch {
    return reply({ ok: false, errors: {}, message: "Invalid request" }, 400);
  }
  if (!body?.kind || !(body.kind in forms)) return reply({ ok: false, errors: {}, message: "Unknown form" }, 400);
  if (body.website_url) return reply({ ok: false, errors: {}, message: "Invalid request" }, 400); // honeypot

  const kind = body.kind as FormKind;
  const { values, errors } = validate(kind, body.values ?? {});
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
