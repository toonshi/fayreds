// OWNER: Mike. STUB — the signatures are the contract; the bodies only log for now.
// TODO(Mike): send client SMS (sms.ts, Kenyan numbers) + email (email.ts, everyone),
// and alert Faith (SMS to site.phoneE164, optional WhatsApp via CallMeBot).

/** Called right after an enquiry is saved (all four forms). */
export async function notifyEnquiryReceived(enquiryId: string): Promise<void> {
  console.log(`[notify:stub] enquiry received ${enquiryId}`);
}

/** Called once when a payment becomes PAID (M-Pesa callback or Stripe webhook). Must be safe to call twice. */
export async function notifyPaymentConfirmed(paymentId: string): Promise<void> {
  console.log(`[notify:stub] payment confirmed ${paymentId}`);
}
