import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { spotsLeft } from "@/lib/trips";
import { Badge } from "../../../_components/Badge";
import { TripForm } from "../../../_components/TripForm";
import { deleteTrip } from "../../../_lib/actions";
import { fmtDateTime, statusColor, statusLabel } from "../../../_lib/format";

export default async function EditTripPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const trip = await db.trip.findUnique({
    where: { id },
    include: { enquiries: { orderBy: { createdAt: "desc" } } },
  });
  if (!trip) notFound();
  const left = await spotsLeft(trip.id);
  const confirmed = trip.enquiries.filter((e) => ["PAID", "IN_PROGRESS", "COMPLETED"].includes(e.status));

  return (
    <div className="space-y-6">
      <Link href="/admin/trips" className="text-sm text-stone-500 hover:underline">← Trips</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <p className="text-sm text-stone-500">
            {left} of {trip.totalSpots} spots left · {confirmed.length} confirmed booking(s) ·{" "}
            <a href={`/trips/${trip.slug}`} target="_blank" className="text-teal-700 hover:underline">view on site ↗</a>
          </p>
        </div>
        {saved && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Saved ✓</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3"><TripForm trip={trip} /></div>

        <aside className="space-y-4 lg:col-span-2">
          <section className="rounded-xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">Travellers</h2>
            <ul className="mt-3 divide-y divide-stone-100 text-sm">
              {trip.enquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-teal-800 hover:underline">{e.name}</Link>
                    <div className="text-xs text-stone-500">{e.spots ?? 1} spot(s) · {fmtDateTime(e.createdAt)}</div>
                  </div>
                  <Badge className={statusColor[e.status]}>{statusLabel(e.status)}</Badge>
                </li>
              ))}
              {trip.enquiries.length === 0 && <li className="py-2 text-stone-500">No reservations yet.</li>}
            </ul>
            {trip.enquiries.length > 0 && (
              <a href={`/admin/export?kind=enquiries&trip=${trip.id}`} className="mt-3 inline-block text-sm text-teal-700 hover:underline">Download traveller list (CSV)</a>
            )}
          </section>

          <form action={deleteTrip.bind(null, trip.id)} className="rounded-xl bg-white p-5 text-sm ring-1 ring-stone-200">
            <h2 className="font-semibold">Remove trip</h2>
            <p className="mt-1 text-stone-500">
              {trip.enquiries.length ? "This trip has reservations, so it will be hidden from the site, not deleted." : "Deletes this trip permanently."}
            </p>
            <button className="mt-3 rounded-md border border-rose-300 px-3 py-1.5 text-rose-700 hover:bg-rose-50">
              {trip.enquiries.length ? "Hide trip" : "Delete trip"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
