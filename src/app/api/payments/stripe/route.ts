// OWNER: Engineer B. Simulated Stripe "hosted checkout" (no real Stripe calls).
import { NextResponse } from "next/server";
import { getOrCreatePendingPayment } from "@/lib/payments";
import type { StripePayRequest, StripePayResponse } from "@/types/contracts";

export const dynamic = "force-dynamic";
const reply = (body: StripePayResponse, status: number) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  try {
    let body: StripePayRequest;
    try {
      body = await req.json();
    } catch {
      return reply({ ok: false, message: "Invalid request" }, 400);
    }

    const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
    if (!reference) return reply({ ok: false, message: "Missing reference" }, 400);

    const result = await getOrCreatePendingPayment(reference, "STRIPE");
    if (!result.ok) return reply({ ok: false, message: result.message }, result.status);

    const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
    const checkoutUrl = `${base}/pay/${encodeURIComponent(reference)}?confirm=stripe`;
    return reply({ ok: true, checkoutUrl }, 200);
  } catch (err) {
    console.error("[stripe] error", err);
    return reply({ ok: false, message: "Something went wrong. Please try again." }, 500);
  }
}
