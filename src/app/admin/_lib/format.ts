import type { EnquiryStatus, EnquiryType, PaymentStatus } from "@prisma/client";
import { allFields, type FormKind } from "@/lib/forms";

export const TYPES: { value: EnquiryType; label: string }[] = [
  { value: "MARKETING", label: "Marketing" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "RESERVATION", label: "Trip reservation" },
];
export const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
];

export const typeLabel = (t: EnquiryType) => TYPES.find((x) => x.value === t)?.label ?? t;
export const statusLabel = (s: EnquiryStatus) => STATUSES.find((x) => x.value === s)?.label ?? s;
export const kindOf = (t: EnquiryType) => t.toLowerCase() as FormKind;

export const statusColor: Record<EnquiryStatus | PaymentStatus, string> = {
  NEW: "bg-sky-100 text-sky-800",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  IN_PROGRESS: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-gray-200 text-gray-700",
  DECLINED: "bg-rose-100 text-rose-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-gray-200 text-gray-700",
};

export const typeColor: Record<EnquiryType, string> = {
  MARKETING: "bg-orange-100 text-orange-800",
  CONSULTATION: "bg-teal-100 text-teal-800",
  PARTNERSHIP: "bg-indigo-100 text-indigo-800",
  RESERVATION: "bg-pink-100 text-pink-800",
};

/** Turns the stored details JSON into [label, value] rows using the form definitions. */
export function detailRows(type: EnquiryType, details: unknown): [string, string][] {
  const d = (details ?? {}) as Record<string, unknown>;
  const fields = allFields(kindOf(type));
  const rows: [string, string][] = [];
  for (const f of fields) {
    const v = d[f.name];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    rows.push([f.label, Array.isArray(v) ? v.join(", ") : String(v)]);
  }
  // anything stored that isn't in the current form definition
  for (const [k, v] of Object.entries(d)) {
    if (!fields.some((f) => f.name === k)) rows.push([k, Array.isArray(v) ? v.join(", ") : String(v)]);
  }
  return rows;
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi" });
export const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
export const fmtMoney = (amount: number, currency: string) =>
  currency === "KES" ? `KES ${amount.toLocaleString("en-KE")}` : `US$${amount.toLocaleString("en-US")}`;

/** "1 spot", "3 spots" */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A YYYY-MM-DD from a date input, as the start of that day in Nairobi (UTC+3, no daylight saving). */
export const nairobiDay = (ymd: string) => new Date(`${ymd}T00:00:00+03:00`);

/** First instant of the current month in Nairobi. */
export function nairobiMonthStart(now = new Date()) {
  const eat = new Date(now.getTime() + 3 * 3600_000);
  return new Date(Date.UTC(eat.getUTCFullYear(), eat.getUTCMonth(), 1) - 3 * 3600_000);
}
export const waNumber = (phone: string) => phone.replace(/[^\d]/g, "");

// ---------------------------------------------------------------------------
// Payments: Mike's payment code stores card (USD) payments in CENTS and M-Pesa (KES) in whole
// shillings (see src/lib/payments.ts and notify.ts). Always display through these helpers.
export const paymentAmount = (p: { amount: number; currency: string }) => (p.currency === "USD" ? p.amount / 100 : p.amount);
export const fmtPayment = (p: { amount: number; currency: string }) => fmtMoney(paymentAmount(p), p.currency);

// ---------------------------------------------------------------------------
// How the client wants to be contacted. Consultations ask it directly; for the other forms we
// assume WhatsApp for Kenyan numbers and email for everyone else (shown as a guess).
export type ContactPref = { via: "WhatsApp" | "Email"; stated: boolean };
export function contactPref(e: { details: unknown; phone: string }): ContactPref {
  const said = (e.details as Record<string, unknown> | null)?.contactVia;
  if (said === "WhatsApp" || said === "Email") return { via: said, stated: true };
  return { via: e.phone.startsWith("+254") ? "WhatsApp" : "Email", stated: false };
}

// ---------------------------------------------------------------------------
/** The few answers Faith needs first, per form type, as [label, value] pairs. */
export function keyFacts(type: EnquiryType, details: unknown, trip?: { title: string } | null, spots?: number | null): [string, string][] {
  const d = (details ?? {}) as Record<string, unknown>;
  const v = (k: string) => {
    const x = d[k];
    if (x === undefined || x === null || x === "" || (Array.isArray(x) && x.length === 0)) return undefined;
    return Array.isArray(x) ? x.join(", ") : String(x);
  };
  const rows: [string, string | undefined][] =
    type === "CONSULTATION" ? [
      ["Destination", v("destination")], ["Dates", v("dates")],
      ["Travellers", v("adults") ? `${v("adults")} adult${v("adults") === "1" ? "" : "s"}${v("children") && v("children") !== "0" ? `, ${v("children")} child${v("children") === "1" ? "" : "ren"}` : ""}` : undefined],
      ["Trip type", v("tripType")], ["Budget pp", v("budget")], ["Needs help with", v("help")],
    ] : type === "RESERVATION" ? [
      ["Trip", trip?.title], ["Spots", spots != null ? String(spots) : v("spots")], ["Paying", v("payOption")],
      ["Room", v("room")], ["Dietary", v("dietary")], ["Emergency contact", v("emergency")],
    ] : type === "MARKETING" ? [
      ["Business", v("businessName")], ["Type", v("businessType")], ["Location", v("location")],
      ["Wants", v("deliverables")], ["Goal", v("goal")], ["Budget", v("budget")],
    ] : [
      ["Company", v("company")], ["Partner type", v("partnerType")], ["Operates in", v("locations")],
      ["Model", v("model")], ["Commission", v("commission")], ["Website", v("website")],
    ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

/** One line for the enquiries list, e.g. "Zanzibar · 10–20 June · 2 adults · KES 80,000–200,000…" */
export function summaryLine(type: EnquiryType, details: unknown, trip?: { title: string } | null, spots?: number | null) {
  return keyFacts(type, details, trip, spots).slice(0, 4).map(([, val]) => val).join(" · ");
}
