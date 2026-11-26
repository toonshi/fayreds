// OWNER: Mike. Enquiry and payment confirmations: SMS + email to the client, SMS/WhatsApp alert to Faith.
import { db } from "./db";
import { sendSms } from "./sms";
import { sendEmail, escapeHtml } from "./email";
import { site } from "./site";
import { isKenyanPhone } from "./phone";
import { forms, type FormKind } from "./forms";
import { formatMoney } from "./pricing";

const KIND: Record<string, FormKind> = {
  MARKETING: "marketing",
  CONSULTATION: "consultation",
  PARTNERSHIP: "partnership",
  RESERVATION: "reservation",
};

/** SMS always; WhatsApp too if CALLMEBOT_API_KEY is set (callmebot.com, free for personal use). */
async function alertFaith(message: string) {
  await sendSms(site.phoneE164, message);
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return;
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(site.whatsapp)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;
    await fetch(url);
  } catch (err) {
    console.error("[notify] CallMeBot alert failed", err);
  }
}

/**
 * Called right after an enquiry is saved (all four forms).
 * Only reads the enquiry and sends — safe to call again, it will just resend the same confirmation.
 */
export async function notifyEnquiryReceived(enquiryId: string): Promise<void> {
  const enquiry = await db.enquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) return;

  const title = forms[KIND[enquiry.type]].title;
  const message = `Hi ${enquiry.name}, thanks for your ${title.toLowerCase()} request with ${site.name}. Your reference is ${enquiry.reference}. We'll be in touch soon.`;

  if (isKenyanPhone(enquiry.phone)) await sendSms(enquiry.phone, message);
  await sendEmail(
    enquiry.email,
    `We've received your request — ${enquiry.reference}`,
    "Thanks for reaching out",
    `<p>Hi ${escapeHtml(enquiry.name)},</p>
     <p>We've received your ${escapeHtml(title.toLowerCase())} request. Your reference is <strong>${enquiry.reference}</strong>.</p>
     <p>We'll be in touch soon.</p>`,
  );

  await alertFaith(`New ${title.toLowerCase()} enquiry from ${enquiry.name} (${enquiry.reference}). Check admin.`);
}

/**
 * Called once when a payment becomes PAID (M-Pesa callback or Stripe webhook).
 * Idempotency contract: the caller must only invoke this after atomically moving the Payment
 * row from PENDING to PAID (an `updateMany` guarded on the old status, acting only if a row
 * actually changed). A duplicate webhook that finds the row already PAID must skip that update
 * and never reach this function, so a retried callback can't send a second receipt.
 */
export async function notifyPaymentConfirmed(paymentId: string): Promise<void> {
  const payment = await db.payment.findUnique({ where: { id: paymentId }, include: { enquiry: true } });
  if (!payment) return;
  const { enquiry } = payment;

  // Payment.amount is whole KES for M-Pesa but USD cents for Stripe (Stripe's convention).
  const displayAmount = payment.currency === "USD" ? payment.amount / 100 : payment.amount;
  const amount = formatMoney({ currency: payment.currency as "KES" | "USD", amount: displayAmount });
  const message = `Payment received, ref ${enquiry.reference}. Amount: ${amount}. Thank you!`;

  if (isKenyanPhone(enquiry.phone)) await sendSms(enquiry.phone, message);
  await sendEmail(
    enquiry.email,
    `Payment received — ${enquiry.reference}`,
    "Payment confirmed",
    `<p>Hi ${escapeHtml(enquiry.name)},</p>
     <p>We've received your payment of <strong>${amount}</strong> for ${escapeHtml(payment.description)}.</p>
     <p>Reference: <strong>${enquiry.reference}</strong></p>`,
  );

  await alertFaith(`Payment received: ${amount} for ${enquiry.reference} (${enquiry.name}).`);
}
