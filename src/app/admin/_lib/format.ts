import type { EnquiryStatus, EnquiryType, PaymentStatus } from "@prisma/client";
import { allFields, forms, type FormKind } from "@/lib/forms";

export const TYPES: { value: EnquiryType; label: string }[] = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "MARKETING", label: "Marketing" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "RESERVATION", label: "Trip booking" },
];
export const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
];

/** The inbox views: grouped by what Faith has to do, not by database status. */
export const VIEWS: { value: string; label: string; statuses: EnquiryStatus[] | null }[] = [
  { value: "reply", label: "Needs reply", statuses: ["NEW"] },
  { value: "active", label: "In progress", statuses: ["AWAITING_PAYMENT", "PAID", "IN_PROGRESS"] },
  { value: "done", label: "Done", statuses: ["COMPLETED", "DECLINED"] },
  { value: "all", label: "All", statuses: null },
];

export const typeLabel = (t: EnquiryType) => TYPES.find((x) => x.value === t)?.label ?? t;
export const statusLabel = (s: EnquiryStatus) => STATUSES.find((x) => x.value === s)?.label ?? s;
export const paymentStatusLabel = (s: PaymentStatus) => s.charAt(0) + s.slice(1).toLowerCase();
export const kindOf = (t: EnquiryType) => t.toLowerCase() as FormKind;

/** Status colour lives only in a small dot; the word next to it carries the meaning. */
export const statusDot: Record<EnquiryStatus | PaymentStatus, string> = {
  NEW: "bg-brand-600",
  AWAITING_PAYMENT: "bg-sun-500",
  PAID: "bg-emerald-600",
  IN_PROGRESS: "bg-brand-300",
  COMPLETED: "bg-stone-300",
  DECLINED: "bg-rose-400",
  PENDING: "bg-sun-500",
  FAILED: "bg-rose-500",
  CANCELLED: "bg-stone-300",
};

type Details = Record<string, unknown>;
const str = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
const has = (v: unknown) => !(v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0));

/** Turns the stored details JSON into [label, value] rows using the form definitions (used by the CSV export). */
export function detailRows(type: EnquiryType, details: unknown): [string, string][] {
  const d = (details ?? {}) as Details;
  const fields = allFields(kindOf(type));
  const rows: [string, string][] = [];
  for (const f of fields) if (has(d[f.name])) rows.push([f.label, str(d[f.name])]);
  for (const [k, v] of Object.entries(d)) if (!fields.some((f) => f.name === k)) rows.push([k, str(v)]);
  return rows;
}

/** Short labels written for Faith (the form's labels are questions written for the client). */
const ADMIN_LABEL: Record<string, string> = {
  destination: "Destination", departure: "Flying from", tripType: "Trip type", dates: "Dates", adults: "Adults",
  children: "Children", budget: "Budget", stay: "Likes to stay in", interests: "Enjoys", help: "Needs help with",
  contactVia: "Prefers", role: "Role", businessName: "Business", businessType: "Type", location: "Location",
  website: "Website", deliverables: "Wants", goal: "Goal", audience: "Audience", timing: "Timing", source: "Found Faith on",
  company: "Company", partnerType: "Type", locations: "Operates in", model: "Open to", commission: "Commission",
  priceRange: "Typical price", bookingSystem: "Tracking", start: "Start", spots: "Spots", payOption: "Paying",
  travellers: "Other travellers", room: "Room", dietary: "Dietary needs", emergency: "Emergency contact",
  ages: "Ages", nights: "Nights", transfers: "Transfers",
};

// shown in the enquiry header instead (name, email, phone, country) or on their own (the free-text message)
const CONTACT = new Set(["name", "email", "phone", "country", "message"]);

/** The answers grouped the way the form asked them, minus contact details and the message. */
export function detailGroups(type: EnquiryType, details: unknown): { title: string; rows: [string, string][] }[] {
  const d = (details ?? {}) as Details;
  const def = forms[kindOf(type)];
  const groups = def.sections.map((s) => ({
    title: def.sections.length === 1 ? "Booking" : s.title === "Your details" ? "About them" : s.title.replace(/^Your /, "Their "),
    rows: s.fields
      .filter((f) => !CONTACT.has(f.name) && has(d[f.name]) && !(f.type === "number" && Number(d[f.name]) === 0))
      .map((f) => [ADMIN_LABEL[f.name] ?? f.label, str(d[f.name])] as [string, string]),
  }));
  const known = new Set(def.sections.flatMap((s) => s.fields.map((f) => f.name)));
  const extra = Object.entries(d).filter(([k, v]) => !known.has(k) && has(v)).map(([k, v]) => [k, str(v)] as [string, string]);
  if (extra.length) groups.push({ title: "Other answers", rows: extra });
  return groups.filter((g) => g.rows.length);
}

export const messageOf = (details: unknown) => {
  const m = ((details ?? {}) as Details).message;
  return typeof m === "string" && m.trim() ? m.trim() : undefined;
};


const TZ = "Africa/Nairobi";
export const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(d);
export const fmtDateTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
const fmtDayMonth = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(d);

/** "Just now", "12m ago", "3h ago", "Yesterday", "24 Nov". Rendered on the server only. */
export function relTime(d: Date, now = new Date()) {
  const min = Math.round((now.getTime() - d.getTime()) / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (min < 24 * 60) return `${Math.round(min / 60)}h ago`;
  if (min < 48 * 60) return "Yesterday";
  return fmtDayMonth(d);
}

export const fmtMoney = (amount: number, currency: string) =>
  currency === "KES"
    ? `KES ${new Intl.NumberFormat("en-KE").format(amount)}`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

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
