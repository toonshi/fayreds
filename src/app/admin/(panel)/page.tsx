import Link from "next/link";
import type { EnquiryStatus, EnquiryType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { Badge } from "../_components/Badge";
import { STATUSES, TYPES, fmtDateTime, statusColor, statusLabel, typeColor, typeLabel } from "../_lib/format";

const PAGE_SIZE = 25;
type Search = { type?: string; status?: string; q?: string; from?: string; to?: string; page?: string };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const type = TYPES.some((t) => t.value === sp.type) ? (sp.type as EnquiryType) : undefined;
  const status = STATUSES.some((s) => s.value === sp.status) ? (sp.status as EnquiryStatus) : undefined;
  const q = sp.q?.trim();
  const page = Math.max(1, Number(sp.page) || 1);
  const from = sp.from ? new Date(sp.from) : undefined;
  const to = sp.to ? new Date(new Date(sp.to).getTime() + 86_400_000) : undefined;

  const where: Prisma.EnquiryWhereInput = {
    type,
    status,
    createdAt: from || to ? { gte: from, lt: to } : undefined,
    OR: q
      ? [
          { reference: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q.replace(/\s/g, "") } },
        ]
      : undefined,
  };

  const [rows, total, byType, byStatus] = await Promise.all([
    db.enquiry.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      include: { trip: { select: { title: true } } },
    }),
    db.enquiry.count({ where }),
    db.enquiry.groupBy({ by: ["type"], _count: true }),
    db.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const countType = (t: EnquiryType) => byType.find((x) => x.type === t)?._count ?? 0;
  const countStatus = (s: EnquiryStatus) => byStatus.find((x) => x.status === s)?._count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { ...sp, page: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v));
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };
  const exportQs = new URLSearchParams(Object.entries({ type, status, q, from: sp.from, to: sp.to }).filter(([, v]) => v) as [string, string][]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Enquiries</h1>
          <p className="text-sm text-stone-500">Every form submitted on the website.</p>
        </div>
        <a href={`/admin/export?kind=enquiries&${exportQs}`} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50">
          Export CSV
        </a>
      </div>

      {/* counts per type: also act as filters */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard href={qs({ type: undefined })} label="All" value={byType.reduce((n, x) => n + x._count, 0)} active={!type} />
        {TYPES.map((t) => (
          <StatCard key={t.value} href={qs({ type: t.value })} label={t.label} value={countType(t.value)} active={type === t.value} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={qs({ status: undefined })} className={pill(!status)}>Any status</Link>
        {STATUSES.map((s) => (
          <Link key={s.value} href={qs({ status: s.value })} className={pill(status === s.value)}>
            {s.label} <span className="text-stone-400">{countStatus(s.value)}</span>
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3 ring-1 ring-stone-200">
        {type && <input type="hidden" name="type" value={type} />}
        {status && <input type="hidden" name="status" value={status} />}
        <label className="flex-1 min-w-48">
          <span className="text-xs text-stone-500">Search name, email, phone or reference</span>
          <input name="q" defaultValue={q} className="mt-0.5 w-full rounded-md border border-stone-300 px-3 py-1.5" />
        </label>
        <label>
          <span className="text-xs text-stone-500">From</span>
          <input type="date" name="from" defaultValue={sp.from} className="mt-0.5 block rounded-md border border-stone-300 px-2 py-1.5" />
        </label>
        <label>
          <span className="text-xs text-stone-500">To</span>
          <input type="date" name="to" defaultValue={sp.to} className="mt-0.5 block rounded-md border border-stone-300 px-2 py-1.5" />
        </label>
        <button className="rounded-md bg-teal-700 px-4 py-1.5 font-medium text-white hover:bg-teal-800">Search</button>
        {(q || sp.from || sp.to || type || status) && <Link href="/admin" className="px-2 py-1.5 text-sm text-stone-500 hover:underline">Clear all</Link>}
      </form>

      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((e) => (
              <tr key={e.id} className="hover:bg-stone-50">
                <td className="whitespace-nowrap px-4 py-3 text-stone-500">{fmtDateTime(e.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-teal-800 hover:underline">{e.name}</Link>
                  <div className="text-xs text-stone-500">{e.trip?.title ?? e.country}</div>
                </td>
                <td className="px-4 py-3"><Badge className={typeColor[e.type]}>{typeLabel(e.type)}</Badge></td>
                <td className="px-4 py-3"><Badge className={statusColor[e.status]}>{statusLabel(e.status)}</Badge></td>
                <td className="px-4 py-3 text-stone-600">
                  <div>{e.phone}</div>
                  <div className="text-xs">{e.email}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{e.reference}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-500">No enquiries match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">{total} enquiries · page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: String(page - 1) })} className="rounded-md border bg-white px-3 py-1">← Newer</Link>}
            {page < pages && <Link href={qs({ page: String(page + 1) })} className="rounded-md border bg-white px-3 py-1">Older →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}

const pill = (active: boolean) =>
  `rounded-full px-3 py-1 ring-1 ${active ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"}`;

function StatCard({ href, label, value, active }: { href: string; label: string; value: number; active: boolean }) {
  return (
    <Link href={href} className={`rounded-xl bg-white p-4 ring-1 ${active ? "ring-2 ring-teal-600" : "ring-stone-200 hover:ring-stone-300"}`}>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </Link>
  );
}
