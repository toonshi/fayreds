import Link from "next/link";
import type { PaymentProvider, PaymentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FilterSelect } from "../../_components/FilterSelect";
import { StatusLabel } from "../../_components/StatusLabel";
import { fmtDateTime, fmtMoney, nairobiMonthStart, paymentStatusLabel, typeLabel } from "../../_lib/format";
import { btn } from "../../_lib/ui";

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
  const sum = (rows: typeof totals, c: string) => rows.find((r) => r.currency === c)?._sum.amount ?? 0;
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const link = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ provider, status, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/payments${p.size ? `?${p}` : ""}`;
  };
  const exportHref = `/admin/export?kind=payments${provider ? `&provider=${provider}` : ""}${status ? `&status=${status}` : ""}`;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Payments</h1>

      {/* received money: two periods, two currencies, read left to right */}
      <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-[auto_auto_1fr]">
        <Total label="Received this month" kes={sum(monthTotals, "KES")} usd={sum(monthTotals, "USD")} />
        <Total label="Received all time" kes={sum(totals, "KES")} usd={sum(totals, "USD")} />
      </dl>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <h2 className="text-[15px] font-semibold">All payments</h2>
        <div className="flex flex-wrap gap-2">
          <FilterSelect param="provider" label="Payment method" value={provider}
            options={[{ value: "", label: "M-Pesa and card" }, { value: "MPESA", label: "M-Pesa only" }, { value: "STRIPE", label: "Card only" }]} />
          <FilterSelect param="status" label="Payment status" value={status}
            options={[{ value: "", label: "Any status" }, ...PSTATUS.map((s) => ({ value: s, label: paymentStatusLabel(s) }))]} />
        </div>
      </div>

      {payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-stone-500">
              <tr className="border-b border-stone-100">
                <th scope="col" className="py-3 pr-6 font-normal">Client</th>
                <th scope="col" className="py-3 pr-6 font-normal">Method</th>
                <th scope="col" className="py-3 pr-6 text-right font-normal">Amount</th>
                <th scope="col" className="py-3 pr-6 font-normal">Status</th>
                <th scope="col" className="py-3 text-right font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="py-3.5 pr-6">
                    <Link href={`/admin/enquiries/${p.enquiryId}`} className="font-medium text-stone-900 underline-offset-4 hover:text-brand-800 hover:underline">{p.enquiry.name}</Link>
                    <span className="ml-2 text-stone-500">{typeLabel(p.enquiry.type)}</span>
                  </td>
                  <td className="py-3.5 pr-6 text-stone-600">
                    {p.provider === "MPESA" ? "M-Pesa" : "Card"}
                    {p.mpesaReceipt && <span translate="no" className="ml-2 text-stone-400 tabular-nums">{p.mpesaReceipt}</span>}
                  </td>
                  <td className="py-3.5 pr-6 text-right font-medium whitespace-nowrap tabular-nums">{fmtMoney(p.amount, p.currency)}</td>
                  <td className="py-3.5 pr-6">
                    <StatusLabel status={p.status}>{paymentStatusLabel(p.status)}</StatusLabel>
                    {p.failureReason && <span className="mt-0.5 block text-[13px] text-stone-500">{p.failureReason}</span>}
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap text-stone-500 tabular-nums">{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-[15px] font-medium text-stone-900">{provider || status ? "No payments match these filters" : "No payments yet"}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-stone-500">M-Pesa and card payments for consultations and trip bookings appear here as soon as clients pay.</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
        <a href={exportHref} className={btn.quiet + " -ml-3"}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
          Download as CSV
        </a>
        {pages > 1 && (
          <div className="flex items-center gap-3">
            <span className="tabular-nums">Page {page} of {pages}</span>
            {page > 1 && <Link href={link({ page: String(page - 1) })} className={btn.secondary}>Newer</Link>}
            {page < pages && <Link href={link({ page: String(page + 1) })} className={btn.secondary}>Older</Link>}
          </div>
        )}
      </div>
    </div>
  );
}

function Total({ label, kes, usd }: { label: string; kes: number; usd: number }) {
  return (
    <div>
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="mt-1.5 text-2xl font-semibold tabular-nums">{fmtMoney(kes, "KES")}</dd>
      <dd className="mt-0.5 text-sm text-stone-600 tabular-nums">{fmtMoney(usd, "USD")} by card</dd>
    </div>
  );
}
