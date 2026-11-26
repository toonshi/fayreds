import Link from "next/link";
import { db } from "@/lib/db";
import { spotsLeft } from "@/lib/trips";
import { Badge } from "../../_components/Badge";
import { togglePublished } from "../../_lib/actions";
import { fmtDate, fmtMoney } from "../../_lib/format";

export default async function TripsPage() {
  const trips = await db.trip.findMany({ orderBy: { startDate: "asc" } });
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));
  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-sm text-stone-500">Published upcoming trips appear on the website with a &ldquo;Reserve&rdquo; button.</p>
        </div>
        <Link href="/admin/trips/new" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">+ New trip</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {trips.map((t, i) => {
          const past = t.endDate < now;
          return (
            <div key={t.id} className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-stone-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/trips/${t.id}`} className="text-lg font-semibold text-teal-800 hover:underline">{t.title}</Link>
                  <p className="text-sm text-stone-500">{t.destination} · {fmtDate(t.startDate)} – {fmtDate(t.endDate)}</p>
                </div>
                {past ? <Badge className="bg-gray-200 text-gray-700">Past</Badge>
                  : t.published ? <Badge className="bg-emerald-100 text-emerald-800">Live</Badge>
                  : <Badge className="bg-amber-100 text-amber-800">Hidden</Badge>}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div><dt className="text-xs text-stone-500">Price</dt><dd>{fmtMoney(t.priceKes, "KES")}<br />{fmtMoney(t.priceUsd, "USD")}</dd></div>
                <div><dt className="text-xs text-stone-500">Deposit</dt><dd>{fmtMoney(t.depositKes, "KES")}<br />{fmtMoney(t.depositUsd, "USD")}</dd></div>
                <div><dt className="text-xs text-stone-500">Spots left</dt><dd className="text-lg font-bold">{left[i]}<span className="text-sm font-normal text-stone-500"> / {t.totalSpots}</span></dd></div>
              </dl>
              <div className="mt-4 flex gap-2 border-t border-stone-100 pt-4 text-sm">
                <Link href={`/admin/trips/${t.id}`} className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-50">Edit & travellers</Link>
                <form action={togglePublished.bind(null, t.id)}>
                  <button className="rounded-md px-3 py-1.5 text-stone-600 hover:bg-stone-100">{t.published ? "Hide from site" : "Publish"}</button>
                </form>
              </div>
            </div>
          );
        })}
        {trips.length === 0 && <p className="text-stone-500">No trips yet. Create the first one.</p>}
      </div>
    </div>
  );
}
