// OWNER: Engineer B. Simulated M-Pesa STK push (no real Daraja calls).
import { NextResponse } from "next/server";
import { normalisePhone, isKenyanPhone } from "@/lib/phone";
import { getOrCreatePendingPayment } from "@/lib/payments";
import type { MpesaPayRequest, MpesaPayResponse } from "@/types/contracts";

export const dynamic = "force-dynamic";
const reply = (body: MpesaPayResponse, status: number) => NextResponse.json(body, { status });

export async function POST(req: Request) {
  try {
    let body: MpesaPayRequest;
    try {
      body = await req.json();
    } catch {
      return reply({ ok: false, message: "Invalid request" }, 400);
    }

    const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
    if (!reference) return reply({ ok: false, message: "Missing reference" }, 400);

    const phone = normalisePhone(String(body?.phone ?? ""));
    if (!phone || !isKenyanPhone(phone)) {
      return reply({ ok: false, message: "Enter a Safaricom M-Pesa number, e.g. 0712 345 678" }, 422);
    }

    const result = await getOrCreatePendingPayment(reference, "MPESA");
    if (!result.ok) return reply({ ok: false, message: result.message }, result.status);

    console.log("[mpesa] simulated STK push to", phone, "payment", result.payment.id);
    return reply({ ok: true, paymentId: result.payment.id }, 200);
  } catch (err) {
    console.error("[mpesa] error", err);
    return reply({ ok: false, message: "Something went wrong. Please try again." }, 500);
  }
}
