// OWNER: Mike. Payment lifecycle. Simulated providers for now (no Daraja/Stripe network calls); mpesa.ts/stripe.ts stay parked until keys land.
import type { Payment, PaymentProvider } from "@prisma/client";
import { db } from "./db";
import { quoteFor, formatMoney } from "./pricing";
import { isKenyanClient } from "./phone";
import { notifyPaymentConfirmed } from "./notify";
import type { PayMethod, PaymentStatusResponse } from "@/types/contracts";

/** Simulated provider confirmation delays. A PENDING payment flips to PAID the first time
 *  its status is polled this long after it was created (no timers — serverless-safe). */
export const MPESA_CONFIRM_DELAY_MS = 4000;
export const STRIPE_CONFIRM_DELAY_MS = 3000;

export type PaymentOption = {
  method: PayMethod; // "mpesa" | "stripe"
  currency: "KES" | "USD";
  /** charge units: whole KES for mpesa, USD CENTS for stripe (matches Payment.amount) */
  amount: number;
  /** human string, e.g. "KES 13,000" or "$100" */
  display: string;
};

export type PayableEnquiry = {
  reference: string;
  enquiryType: "CONSULTATION" | "RESERVATION";
  name: string;
  /** +E.164, prefills the M-Pesa phone field */
  phone: string;
  /** quote label, e.g. "Travel consultation" or "Lamu Escape: deposit × 2" */
  label: string;
  options: { mpesa: PaymentOption; stripe: PaymentOption };
  defaultMethod: PayMethod;
  /** most recently created Payment row for this enquiry, any status */
  latestPayment: { id: string; status: "PENDING" | "PAID" | "FAILED" | "CANCELLED"; provider: PaymentProvider } | null;
};

export type StartPaymentResult = { ok: true; payment: Payment } | { ok: false; status: 404 | 409 | 422; message: string };

// `quoteFor` picks its currency from `isKenyanClient(country, phone)` internally, so to price the
// *other* method we re-run it on a shallow clone with overridden locality fields rather than
// editing pricing.ts.
function optionsFor(enquiry: Parameters<typeof quoteFor>[0]): { mpesa: PaymentOption; stripe: PaymentOption } {
  const kes = quoteFor({ ...enquiry, country: "Kenya", phone: "+254700000000" }); // -> currency "KES"
  const usd = quoteFor({ ...enquiry, country: "Other", phone: "+15550000000" }); // -> currency "USD"
  return {
    mpesa: { method: "mpesa", currency: "KES", amount: kes.amount, display: formatMoney(kes) },
    stripe: { method: "stripe", currency: "USD", amount: Math.round(usd.amount * 100), display: formatMoney(usd) },
  };
}

export async function getPayableEnquiry(reference: string): Promise<PayableEnquiry | null> {
  const enquiry = await db.enquiry.findUnique({ where: { reference }, include: { trip: true } });
  if (!enquiry || (enquiry.type !== "CONSULTATION" && enquiry.type !== "RESERVATION")) return null;

  let options: { mpesa: PaymentOption; stripe: PaymentOption };
  let label: string;
  try {
    options = optionsFor(enquiry);
    label = quoteFor(enquiry).label;
  } catch {
    // quoteFor throws for a RESERVATION with no trip — becomes a clean null, not a 500.
    return null;
  }

  const latest = await db.payment.findFirst({
    where: { enquiryId: enquiry.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, provider: true },
  });

  return {
    reference: enquiry.reference,
    enquiryType: enquiry.type,
    name: enquiry.name,
    phone: enquiry.phone,
    label,
    options,
    defaultMethod: isKenyanClient(enquiry.country, enquiry.phone) ? "mpesa" : "stripe",
    latestPayment: latest ? { id: latest.id, status: latest.status, provider: latest.provider } : null,
  };
}

export async function getOrCreatePendingPayment(reference: string, provider: PaymentProvider): Promise<StartPaymentResult> {
  const enquiry = await db.enquiry.findUnique({ where: { reference }, include: { trip: true } });
  if (!enquiry || (enquiry.type !== "CONSULTATION" && enquiry.type !== "RESERVATION")) {
    return { ok: false, status: 404, message: "We couldn't find that reference." };
  }

  const alreadyPaid = await db.payment.findFirst({ where: { enquiryId: enquiry.id, status: "PAID" } });
  if (alreadyPaid) {
    return { ok: false, status: 409, message: "This payment has already been completed." };
  }

  let opt: PaymentOption;
  let label: string;
  try {
    const options = optionsFor(enquiry);
    opt = provider === "MPESA" ? options.mpesa : options.stripe;
    label = quoteFor(enquiry).label;
  } catch {
    return { ok: false, status: 422, message: "We can't price this request. Please contact us." };
  }

  // Cancel stale PENDING rows for the *other* provider (stops an abandoned row later flipping to
  // PAID and firing a second receipt).
  await db.payment.updateMany({
    where: { enquiryId: enquiry.id, status: "PENDING", provider: { not: provider } },
    data: { status: "CANCELLED", failureReason: "Switched payment method" },
  });

  // Reuse an existing PENDING row for the same provider, re-stamping its clock so retry behaves
  // identically to a fresh start.
  const existing = await db.payment.findFirst({
    where: { enquiryId: enquiry.id, provider, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  let payment: Payment;
  if (existing) {
    payment = await db.payment.update({
      where: { id: existing.id },
      data: { amount: opt.amount, currency: opt.currency, description: label, createdAt: new Date(), failureReason: null },
    });
  } else {
    payment = await db.payment.create({
      data: {
        enquiryId: enquiry.id,
        provider,
        amount: opt.amount,
        currency: opt.currency,
        description: label,
        ...(provider === "MPESA"
          ? { mpesaCheckoutId: `ws_SIM_${crypto.randomUUID()}` }
          : { stripeSessionId: `cs_sim_${crypto.randomUUID()}` }),
      },
    });
  }

  console.log("[payments] simulated", provider, payment.id, opt.display);
  return { ok: true, payment };
}

/** The ONLY place a Payment becomes PAID. Honors notify.ts's documented idempotency contract via
 *  an atomic `updateMany` guarded on the old status, acting only if a row actually changed, so a
 *  duplicate poll never notifies twice. */
export async function markPaymentPaid(paymentId: string, fields?: { mpesaReceipt?: string }): Promise<boolean> {
  const result = await db.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "PAID", paidAt: new Date(), ...(fields ?? {}) },
  });
  if (result.count === 0) return false;

  const payment = await db.payment.findUnique({ where: { id: paymentId }, select: { enquiryId: true } });
  if (payment) {
    await db.enquiry.updateMany({
      where: { id: payment.enquiryId, status: { in: ["NEW", "AWAITING_PAYMENT"] } },
      data: { status: "PAID" },
    });
  }
  await notifyPaymentConfirmed(paymentId).catch((e) => console.error("[notify] payment confirmation failed", e));
  return true;
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse | null> {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return null;

  if (payment.status === "PENDING") {
    const delay = payment.provider === "MPESA" ? MPESA_CONFIRM_DELAY_MS : STRIPE_CONFIRM_DELAY_MS;
    if (Date.now() - payment.createdAt.getTime() >= delay) {
      const flipped = await markPaymentPaid(
        payment.id,
        payment.provider === "MPESA" ? { mpesaReceipt: `SIM${crypto.randomUUID().slice(0, 8).toUpperCase()}` } : undefined,
      );
      if (flipped) return { status: "PAID" };
      const fresh = await db.payment.findUnique({ where: { id: paymentId }, select: { status: true, failureReason: true } });
      return { status: (fresh?.status ?? "PENDING") as PaymentStatusResponse["status"], message: fresh?.failureReason ?? undefined };
    }
    return { status: "PENDING" };
  }

  return {
    status: payment.status,
    message:
      payment.status === "FAILED"
        ? payment.failureReason ?? "The payment did not go through."
        : payment.status === "CANCELLED"
          ? payment.failureReason ?? "The payment was cancelled."
          : undefined,
  };
}
