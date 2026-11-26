import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { Badge } from "../../../_components/Badge";
import { updateEnquiry } from "../../../_lib/actions";
import {
  STATUSES, detailRows, fmtDate, fmtDateTime, fmtMoney, statusColor, statusLabel, typeColor, typeLabel, waNumber,
} from "../../../_lib/format";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await db.enquiry.findUnique({
    where: { id },
    include: { trip: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!e) notFound();

  const firstName = e.name.split(" ")[0];
  const waText = `Hi ${firstName}, this is Faith from ${site.name} about your ${typeLabel(e.type).toLowerCase()} request (${e.reference}).`;
  const save = updateEnquiry.bind(null, e.id);

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-stone-500 hover:underline">← All enquiries</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={typeColor[e.type]}>{typeLabel(e.type)}</Badge>
            <Badge className={statusColor[e.status]}>{statusLabel(e.status)}</Badge>
            <span className="font-mono text-xs text-stone-500">{e.reference}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">{e.name}</h1>
          <p className="text-sm text-stone-500">Received {fmtDateTime(e.createdAt)} · {e.country}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <a href={`https://wa.me/${waNumber(e.phone)}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700">WhatsApp</a>
          <a href={`tel:${e.phone}`} className="rounded-lg border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50">Call</a>
          <a href={`mailto:${e.email}?subject=${encodeURIComponent(`${site.name}: your request ${e.reference}`)}`}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50">Email</a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">Contact</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Row label="Phone" value={e.phone} />
              <Row label="Email" value={e.email} />
              <Row label="Country" value={e.country} />
              {e.trip && <Row label="Trip" value={`${e.trip.title} (${fmtDate(e.trip.startDate)})`} />}
              {e.spots != null && <Row label="Spots" value={String(e.spots)} />}
            </dl>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">Answers</h2>
            <dl className="mt-3 divide-y divide-stone-100 text-sm">
              {detailRows(e.type, e.details).map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2 sm:grid-cols-3">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="whitespace-pre-wrap sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {e.payments.length > 0 && (
            <section className="rounded-xl bg-white p-5 ring-1 ring-stone-200">
              <h2 className="font-semibold">Payments</h2>
              <ul className="mt-3 divide-y divide-stone-100 text-sm">
                {e.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>{p.provider === "MPESA" ? "M-Pesa" : "Card"} · {fmtMoney(p.amount, p.currency)}</span>
                    <span className="text-xs text-stone-500">{p.mpesaReceipt ?? p.failureReason ?? ""}</span>
                    <span className="flex items-center gap-2">
                      <Badge className={statusColor[p.status]}>{p.status.toLowerCase()}</Badge>
                      <span className="text-xs text-stone-500">{fmtDateTime(p.paidAt ?? p.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside>
          <form action={save} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 lg:sticky lg:top-20">
            <h2 className="font-semibold">Manage</h2>
            <label className="block text-sm">
              <span className="text-stone-500">Status</span>
              <select name="status" defaultValue={e.status} className="mt-1 w-full rounded-md border border-stone-300 px-2 py-2">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-stone-500">Private notes</span>
              <textarea name="notes" rows={8} defaultValue={e.notes ?? ""} placeholder="Calls, quotes sent, follow-up dates…"
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" />
            </label>
            <button className="w-full rounded-lg bg-teal-700 py-2 font-semibold text-white hover:bg-teal-800">Save</button>
            <p className="text-xs text-stone-400">Last updated {fmtDateTime(e.updatedAt)}</p>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-stone-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
