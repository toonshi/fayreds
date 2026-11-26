// Turns what people type into +E.164. Kenyan local formats (07.., 01.., 7..) become +254...
export function normalisePhone(raw: string): string | null {
  let p = (raw || "").replace(/[\s\-().]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (/^0[17]\d{8}$/.test(p)) p = "+254" + p.slice(1);
  else if (/^[17]\d{8}$/.test(p)) p = "+254" + p;
  else if (/^254[17]\d{8}$/.test(p)) p = "+" + p;
  if (!/^\+[1-9]\d{7,14}$/.test(p)) return null;
  return p;
}

export function isKenyanPhone(e164: string) {
  return /^\+254[17]\d{8}$/.test(e164);
}

/** Kenyans pay in KES via M-Pesa; everyone else pays in USD via card (Stripe). */
export function isKenyanClient(country: string, phone: string) {
  return country === "Kenya" || isKenyanPhone(phone);
}
