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
  currency === "KES" ? `KES ${amount.toLocaleString("en-KE")}` : `$${amount.toLocaleString("en-US")}`;
export const waNumber = (phone: string) => phone.replace(/[^\d]/g, "");
