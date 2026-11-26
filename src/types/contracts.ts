// SHARED CONTRACTS — owned by Hendy. Change only through a PR that Hendy approves.
// Frontend (Faith) and APIs (Mike) both code against these types, so they never wait on each other.
import type { FormKind } from "@/lib/forms";

// ---------- POST /api/enquiries ----------
export type EnquiryRequest = {
  kind: FormKind;
  /** answers keyed by field name from src/lib/forms.ts (multi-selects are string[]) */
  values: Record<string, string | string[] | number>;
  /** reservation only: which trip */
  tripSlug?: string;
  /** honeypot: must be empty. Bots fill it. */
  website_url?: string;
};

export type EnquiryCreated = {
  ok: true;
  reference: string; // e.g. "FT-CON-7K3QX"
  /** "pay" for consultation & reservation, "done" for marketing & partnership */
  next: "pay" | "done";
  /** where the frontend sends the user next: /pay/<ref> or /thank-you?ref=<ref> */
  redirectTo: string;
};

export type EnquiryRejected = {
  ok: false;
  /** field name -> message, shown under the field */
  errors: Record<string, string>;
  /** general message, shown at the top of the form */
  message?: string;
};

export type EnquiryResponse = EnquiryCreated | EnquiryRejected; // 201 | 422 / 400 / 429

// ---------- Payments (Mike) ----------
export type PayMethod = "mpesa" | "stripe";

/** POST /api/payments/mpesa */
export type MpesaPayRequest = { reference: string; phone: string };
export type MpesaPayResponse = { ok: true; paymentId: string } | { ok: false; message: string };

/** POST /api/payments/stripe */
export type StripePayRequest = { reference: string };
export type StripePayResponse = { ok: true; checkoutUrl: string } | { ok: false; message: string };

/** GET /api/payments/[id] — polled by /pay page every 3s while waiting for M-Pesa */
export type PaymentStatusResponse = {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  message?: string;
};

// ---------- Pricing ----------
export type Quote = { currency: "KES" | "USD"; amount: number; label: string };
