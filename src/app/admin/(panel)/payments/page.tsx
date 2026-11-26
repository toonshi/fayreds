import Link from "next/link";
import type { PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Badge } from "../../_components/Badge";
import { contactPref, fmtDateTime, fmtMoney, fmtPayment, nairobiMonthStart, statusColor, typeLabel } from "../../_lib/format";
import { ContactButtons } from "../../_components/ContactButtons";

const PROVIDERS: PaymentProvider[] = ["MPESA", "STRIPE"];
const PSTATUS: PaymentStatus[] = ["PAID", "PENDING", "FAILED", "CANCELLED"];

const PAGE_SIZE = 50;

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ provider?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const provider = PROVIDERS.includes(sp.provider as PaymentProvider) ? (sp.provider as PaymentProvider) : undefined;
  const status = PSTATUS.includes(sp.status as PaymentStatus) ? (sp.status as PaymentStatus) : undefined;
  const where: Prisma.PaymentWhereInput = { provider, status };
  const page = Math.max(1, Number(sp.page) || 1);

  const monthStart = nairobiMonthStart();
  const [payments, count, totals, monthTotals] = await Promise.all([
    db.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { enquiry: true } }),
    db.payment.count({ where }),
    db.payment.groupBy({ by: ["currency"], where: { status: "PAID" }, _sum: { amount: true } }),
    db.payment.groupBy({ by: ["currency"], where: { status: "PAID", paidAt: { gte: monthStart } }, _sum: { amount: true } }),
  ]);
  // card (USD) payments are stored in cents, M-Pesa (KES) in whole shillings
  const sum = (rows: typeof totals, c: string) => {
    const raw = rows.find((r) => r.currency === c)?._sum.amount ?? 0;
    return c === "USD" ? raw / 100 : raw;
  };
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/payments${p.size ? `?${p}` : ""}`;
  };
  const pill = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 ring-1 sm:min-h-9 ${active ? "bg-teal-700 text-white ring-teal-700" : "bg-white ring-stone-200 hover:bg-stone-50"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-stone-600">M-Pesa (KES) and card (USD) payments for consultations and trips.</p>
        </div>
        <a href={`/admin/export?kind=payments${provider ? `&provider=${provider}` : ""}${status ? `&status=${status}` : ""}`}
          className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium hover:bg-stone-50">Export CSV</a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="KES this month" value={fmtMoney(sum(monthTotals, "KES"), "KES")} />
        <Stat label="USD this month" value={fmtMoney(sum(monthTotals, "USD"), "USD")} />
        <Stat label="KES all time" value={fmtMoney(sum(totals, "KES"), "KES")} />
        <Stat label="USD all time" value={fmtMoney(sum(totals, "USD"), "USD")} />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 text-sm sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={link({ provider: undefined })} className={pill(!provider)}>All methods</Link>
        <Link href={link({ provider: "MPESA" })} className={pill(provider === "MPESA")}>M-Pesa</Link>
        <Link href={link({ provider: "STRIPE" })} className={pill(provider === "STRIPE")}>Card</Link>
        <span className="mx-1 border-l border-stone-300" />
        <Link href={link({ status: undefined })} className={pill(!status)}>Any status</Link>
        {PSTATUS.map((s) => <Link key={s} href={link({ status: s })} className={pill(status === s)}>{s.toLowerCase()}</Link>)}
      </div>

      <ul className="space-y-3 sm:hidden">
        {payments.map((p) => (
          <li key={p.id} className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/enquiries/${p.enquiryId}`} className="inline-flex min-h-11 items-center font-semibold text-teal-800 hover:underline">{p.enquiry.name}</Link>
                <p className="text-sm text-stone-600">{p.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{fmtPayment(p)}</p>
                <p className="text-xs text-stone-600">{p.provider === "MPESA" ? "M-Pesa" : "Card"}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <Badge className={statusColor[p.status]}>{p.status === "PAID" ? "Paid" : p.status.toLowerCase()}</Badge>
              <span className="tabular-nums">{fmtDateTime(p.paidAt ?? p.createdAt)}</span>
              {p.mpesaReceipt && <span className="font-mono">Receipt {p.mpesaReceipt}</span>}
            </div>
            <div className="mt-3">
              <ContactButtons compact name={p.enquiry.name} phone={p.enquiry.phone} email={p.enquiry.email} reference={p.enquiry.reference} what={typeLabel(p.enquiry.type).toLowerCase()} pref={contactPref(p.enquiry)} />
            </div>
          </li>
        ))}
        {payments.length === 0 && <li className="rounded-xl bg-white p-8 text-center text-stone-600 ring-1 ring-stone-200">No payments yet.</li>}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">For</th>
              <th className="px-4 py-3">Method</th><th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Receipt / ref</th><th className="px-4 py-3">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-stone-600">{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${p.enquiryId}`} className="font-medium text-teal-800 hover:underline">{p.enquiry.name}</Link>
                  <div translate="no" className="whitespace-nowrap font-mono text-xs text-stone-600">{p.enquiry.reference}</div>
                  <div className="text-xs text-stone-600">{p.enquiry.phone}</div>
                </td>
                <td className="px-4 py-3">{typeLabel(p.enquiry.type)}<div className="text-xs text-stone-600">{p.description}</div></td>
                <td className="px-4 py-3">{p.provider === "MPESA" ? "M-Pesa" : "Card"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">{fmtPayment(p)}</td>
                <td className="px-4 py-3"><Badge className={statusColor[p.status]}>{p.status.toLowerCase()}</Badge></td>
                <td className="px-4 py-3 font-mono text-xs text-stone-600">{p.mpesaReceipt ?? p.stripeSessionId?.slice(-12) ?? p.failureReason ?? "—"}</td>
                <td className="px-4 py-3"><ContactButtons compact name={p.enquiry.name} phone={p.enquiry.phone} email={p.enquiry.email} reference={p.enquiry.reference} what={typeLabel(p.enquiry.type).toLowerCase()} pref={contactPref(p.enquiry)} /></td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-stone-600">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="tabular-nums text-stone-600">{count} payments · page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={link({ page: String(page - 1) })} className="inline-flex min-h-11 items-center rounded-md border bg-white px-4">← Newer</Link>}
            {page < pages && <Link href={link({ page: String(page + 1) })} className="inline-flex min-h-11 items-center rounded-md border bg-white px-4">Older →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <div className="text-xs text-stone-600">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
