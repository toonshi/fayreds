// OWNER: Engineer B. Polled by /pay page every 3s while waiting for M-Pesa/Stripe confirmation.
import { NextResponse } from "next/server";
import { getPaymentStatus } from "@/lib/payments";
import type { PaymentStatusResponse } from "@/types/contracts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await getPaymentStatus(id);
    const payload: PaymentStatusResponse = body ?? { status: "FAILED", message: "We couldn't find that payment." };
    return NextResponse.json(payload, { status: body ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[payments:id] error", err);
    return NextResponse.json({ status: "PENDING", message: "Status check failed" } satisfies PaymentStatusResponse, { status: 500 });
  }
}
