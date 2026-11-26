import { siteUrl } from "./site";

/**
 * M-Pesa Express (STK Push) through Safaricom Daraja.
 * MPESA_ENV=sandbox uses Safaricom's test shortcode 174379; set production keys to go live.
 * Without MPESA_CONSUMER_KEY the push is simulated (demo mode) and marked paid after a few seconds.
 */
const base = () =>
  process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

export const mpesaConfigured = () => Boolean(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);

async function token() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${base()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed (${res.status})`);
  return (await res.json()).access_token as string;
}

function timestamp() {
  // Daraja expects YYYYMMDDHHmmss in Kenyan time (EAT, UTC+3)
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

export async function stkPush(opts: { phone: string; amount: number; reference: string; description: string }) {
  const shortcode = process.env.MPESA_SHORTCODE ?? "174379";
  const passkey = process.env.MPESA_PASSKEY ?? "";
  const ts = timestamp();
  const password = Buffer.from(shortcode + passkey + ts).toString("base64");
  const res = await fetch(`${base()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      // Use CustomerBuyGoodsOnline for a Till number, CustomerPayBillOnline for a Paybill
      TransactionType: process.env.MPESA_TRANSACTION_TYPE ?? "CustomerPayBillOnline",
      Amount: Math.round(opts.amount),
      PartyA: opts.phone.replace("+", ""),
      PartyB: process.env.MPESA_PARTY_B ?? shortcode,
      PhoneNumber: opts.phone.replace("+", ""),
      CallBackURL: siteUrl(`/api/payments/mpesa/callback?secret=${process.env.MPESA_CALLBACK_SECRET ?? ""}`),
      AccountReference: opts.reference.slice(0, 12),
      TransactionDesc: opts.description.slice(0, 13),
    }),
  });
  const json = await res.json();
  if (!res.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage || json.ResponseDescription || "M-Pesa request failed");
  }
  return json.CheckoutRequestID as string;
}
