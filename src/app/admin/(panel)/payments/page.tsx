import Link from "next/link";
import type { PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Badge } from "../../_components/Badge";
import { fmtDateTime, fmtMoney, statusColor, typeLabel } from "../../_lib/format";

const PROVIDERS: PaymentProvider[] = ["MPESA", "STRIPE"];
const PSTATUS: PaymentStatus[] = ["PAID", "PENDING", "FAILED", "CANCELLED"];

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ provider?: string; status?: string }> }) {
  const sp = await searchParams;
  const provider = PROVIDERS.includes(sp.provider as PaymentProvider) ? (sp.provider as PaymentProvider) : undefined;
  const status = PSTATUS.includes(sp.status as PaymentStatus) ? (sp.status as PaymentStatus) : undefined;
  const where: Prisma.PaymentWhereInput = { provider, status };

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [payments, totals, monthTotals] = await Promise.all([
    db.payment.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { enquiry: true } }),
    db.payment.groupBy({ by: ["currency"], where: { status: "PAID" }, _sum: { amount: true } }),
    db.payment.groupBy({ by: ["currency"], where: { status: "PAID", paidAt: { gte: monthStart } }, _sum: { amount: true } }),
  ]);
  const sum = (rows: typeof totals, c: string) => rows.find((r) => r.currency === c)?._sum.amount ?? 0;
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/payments${p.size ? `?${p}` : ""}`;
  };
  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 ring-1 ${active ? "bg-teal-700 text-white ring-teal-700" : "bg-white ring-stone-200 hover:bg-stone-50"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-stone-500">M-Pesa (KES) and card (USD) payments for consultations and trips.</p>
        </div>
        <a href={`/admin/export?kind=payments${provider ? `&provider=${provider}` : ""}${status ? `&status=${status}` : ""}`}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50">Export CSV</a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="KES this month" value={fmtMoney(sum(monthTotals, "KES"), "KES")} />
        <Stat label="USD this month" value={fmtMoney(sum(monthTotals, "USD"), "USD")} />
        <Stat label="KES all time" value={fmtMoney(sum(totals, "KES"), "KES")} />
        <Stat label="USD all time" value={fmtMoney(sum(totals, "USD"), "USD")} />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={link({ provider: undefined })} className={pill(!provider)}>All methods</Link>
        <Link href={link({ provider: "MPESA" })} className={pill(provider === "MPESA")}>M-Pesa</Link>
        <Link href={link({ provider: "STRIPE" })} className={pill(provider === "STRIPE")}>Card</Link>
        <span className="mx-1 border-l border-stone-300" />
        <Link href={link({ status: undefined })} className={pill(!status)}>Any status</Link>
        {PSTATUS.map((s) => <Link key={s} href={link({ status: s })} className={pill(status === s)}>{s.toLowerCase()}</Link>)}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">For</th>
              <th className="px-4 py-3">Method</th><th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Receipt / ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="whitespace-nowrap px-4 py-3 text-stone-500">{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${p.enquiryId}`} className="font-medium text-teal-800 hover:underline">{p.enquiry.name}</Link>
                  <div className="font-mono text-xs text-stone-500">{p.enquiry.reference}</div>
                </td>
                <td className="px-4 py-3">{typeLabel(p.enquiry.type)}</td>
                <td className="px-4 py-3">{p.provider === "MPESA" ? "M-Pesa" : "Card"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{fmtMoney(p.amount, p.currency)}</td>
                <td className="px-4 py-3"><Badge className={statusColor[p.status]}>{p.status.toLowerCase()}</Badge></td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{p.mpesaReceipt ?? p.stripeSessionId?.slice(-12) ?? p.failureReason ?? "—"}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-500">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}
