import Link from "next/link";
import type { EnquiryType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FilterSelect } from "../_components/FilterSelect";
import { StatusLabel } from "../_components/StatusLabel";
import { TYPES, VIEWS, fmtDateTime, relTime, statusLabel, summaryLine, typeLabel } from "../_lib/format";
import { btn, input } from "../_lib/ui";

const PAGE_SIZE = 30;
type Search = { view?: string; type?: string; q?: string; page?: string };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const type = TYPES.some((t) => t.value === sp.type) ? (sp.type as EnquiryType) : undefined;
  // a search looks everywhere unless a view was picked on purpose
  const view = VIEWS.find((v) => v.value === sp.view) ?? VIEWS.find((v) => v.value === (q ? "all" : "reply"))!;
  const page = Math.max(1, Number(sp.page) || 1);

  const search: Prisma.EnquiryWhereInput = {
    type,
    OR: q
      ? [
          { reference: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q.replace(/\s/g, "") } },
        ]
      : undefined,
  };
  const where: Prisma.EnquiryWhereInput = { ...search, status: view.statuses ? { in: view.statuses } : undefined };

  const [rows, total, byStatus] = await Promise.all([
    db.enquiry.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      include: { trip: { select: { title: true } } },
    }),
    db.enquiry.count({ where }),
    db.enquiry.groupBy({ by: ["status"], where: search, _count: true }),
  ]);
  const countOf = (v: (typeof VIEWS)[number]) =>
    byStatus.filter((s) => !v.statuses || v.statuses.includes(s.status)).reduce((n, s) => n + s._count, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const now = new Date();

  const href = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ view: sp.view, type, q, ...patch })) if (v) p.set(k, String(v));
    return p.size ? `/admin?${p}` : "/admin";
  };
  const exportHref = `/admin/export?${new URLSearchParams(Object.entries({ kind: "enquiries", view: view.value, type, q }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <form role="search" action="/admin" className="w-full sm:w-80">
          {type && <input type="hidden" name="type" value={type} />}
          <label htmlFor="enquiry-search" className="sr-only">Search enquiries</label>
          <div className="relative">
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input id="enquiry-search" type="search" name="q" defaultValue={q} autoComplete="off" spellCheck={false}
              placeholder="Name, email, phone or reference…" className={`${input} pl-9`} />
          </div>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-stone-200">
        <nav aria-label="Enquiry views" className="-mb-px flex gap-6 overflow-x-auto">
          {VIEWS.map((v) => {
            const on = v.value === view.value;
            return (
              <Link key={v.value} href={href({ view: v.value })} aria-current={on ? "page" : undefined}
                className={`relative inline-flex h-11 shrink-0 items-center gap-2 text-sm transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full ${
                  on ? "font-medium text-stone-900 after:bg-brand-800" : "text-stone-500 hover:text-stone-900"}`}>
                {v.label}
                <span className={`tabular-nums ${on ? "text-stone-500" : "text-stone-400"}`}>{countOf(v)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pb-2">
          <FilterSelect param="type" label="Type of enquiry" value={type}
            options={[{ value: "", label: "All types" }, ...TYPES.map((t) => ({ value: t.value, label: t.label }))]} />
        </div>
      </div>

      {q && (
        <p className="mt-4 text-sm text-stone-600">
          Results for <span className="font-medium text-stone-900">“{q}”</span>
          <Link href={href({ q: undefined, page: undefined })} className="ml-2 text-brand-700 underline-offset-4 hover:underline">Clear search</Link>
        </p>
      )}

      {rows.length > 0 ? (
        <ul className="mt-2">
          {rows.map((e) => {
            const isNew = e.status === "NEW";
            const summary = summaryLine(e.type, e.details, e.trip, e.spots);
            return (
              <li key={e.id} className="border-b border-stone-100 last:border-0">
                <Link href={`/admin/enquiries/${e.id}`}
                  className="-mx-3 grid grid-cols-[0.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 rounded-xl px-3 py-4 transition-colors duration-150 hover:bg-sand-50">
                  <span aria-hidden className={`size-2 self-center rounded-full ${isNew ? "bg-brand-600" : ""}`} />
                  <p className="min-w-0 truncate text-[15px] text-stone-900">
                    <span className={isNew ? "font-semibold" : "font-medium"}>{e.name}</span>
                    {isNew && <span className="sr-only"> (new)</span>}
                    <span className="ml-2 text-sm text-stone-500">{typeLabel(e.type)}</span>
                  </p>
                  <time dateTime={e.createdAt.toISOString()} title={fmtDateTime(e.createdAt)}
                    className={`text-right text-sm whitespace-nowrap tabular-nums ${isNew ? "font-medium text-stone-900" : "text-stone-500"}`}>
                    {relTime(e.createdAt, now)}
                  </time>
                  <span />
                  <p className="min-w-0 truncate text-sm text-stone-600">{summary || e.country}</p>
                  <span className="text-right">
                    {view.value !== "reply" && !isNew && <StatusLabel status={e.status}>{statusLabel(e.status)}</StatusLabel>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty view={view.value} q={q} activeHref={href({ view: "active" })} />
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-stone-500">
        <a href={exportHref} className={btn.quiet + " -ml-3"}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
          Download as CSV
        </a>
        {pages > 1 && (
          <div className="flex items-center gap-3">
            <span className="tabular-nums">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
            {page > 1 ? <Link href={href({ page: String(page - 1) })} className={btn.secondary}>Newer</Link> : <span className={`${btn.secondary} opacity-50`} aria-disabled>Newer</span>}
            {page < pages ? <Link href={href({ page: String(page + 1) })} className={btn.secondary}>Older</Link> : <span className={`${btn.secondary} opacity-50`} aria-disabled>Older</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ view, q, activeHref }: { view: string; q?: string; activeHref: string }) {
  const [title, body] = q
    ? ["Nothing matches that search", "Try part of a name, an email address, a phone number or a reference like FT-CON-…"]
    : view === "reply"
      ? ["You're all caught up", "New enquiries from the website land here until you reply or change their status."]
      : view === "active"
        ? ["Nothing in progress", "Enquiries move here once you reply, or when a client is paying."]
        : ["Nothing here yet", "Enquiries from the website's forms will show up here."];
  return (
    <div className="py-20 text-center">
      <p className="text-[15px] font-medium text-stone-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-stone-500">{body}</p>
      {view === "reply" && !q && <Link href={activeHref} className="mt-4 inline-block text-sm text-brand-700 underline-offset-4 hover:underline">See enquiries in progress</Link>}
    </div>
  );
}
