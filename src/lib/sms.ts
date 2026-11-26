import { isKenyanPhone } from "./phone";

/**
 * Sends SMS through Africa's Talking.
 * Confirmations go to Kenyan (+254) numbers by default. International numbers get
 * email instead, unless SMS_INTERNATIONAL=true (Africa's Talking can deliver abroad, at higher cost).
 * Without AT_API_KEY the message is only logged (demo mode).
 */
export async function sendSms(to: string, message: string): Promise<{ sent: boolean; info: string }> {
  if (!isKenyanPhone(to) && process.env.SMS_INTERNATIONAL !== "true") {
    return { sent: false, info: "international number: SMS skipped, email used" };
  }
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) {
    console.log(`[sms:demo] to ${to}: ${message}`);
    return { sent: false, info: "demo mode (no Africa's Talking keys)" };
  }
  const host = username === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
  const body = new URLSearchParams({ username, to, message });
  if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);
  try {
    const res = await fetch(`https://${host}/version1/messaging`, {
      method: "POST",
      headers: { apiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await res.json().catch(() => ({}));
    const status = json?.SMSMessageData?.Recipients?.[0]?.status ?? res.statusText;
    if (!res.ok || status !== "Success") console.error("[sms] failed", to, JSON.stringify(json));
    return { sent: status === "Success", info: String(status) };
  } catch (err) {
    console.error("[sms] error", err);
    return { sent: false, info: "network error" };
  }
}
