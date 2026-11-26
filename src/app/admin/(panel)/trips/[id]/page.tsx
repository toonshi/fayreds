import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { spotsLeft } from "@/lib/trips";
import { Badge } from "../../../_components/Badge";
import { TripForm } from "../../../_components/TripForm";
import { deleteTrip } from "../../../_lib/actions";
import { BackLink } from "../../../_components/BackLink";
import { SavedNotice } from "../../../_components/SavedNotice";
import { SubmitButton } from "../../../_components/SubmitButton";
import { Suspense } from "react";
import { fmtDateTime, plural, statusColor, statusLabel } from "../../../_lib/format";

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await db.trip.findUnique({
    where: { id },
    include: { enquiries: { orderBy: { createdAt: "desc" } } },
  });
  if (!trip) notFound();
  const left = await spotsLeft(trip.id);
  const confirmed = trip.enquiries.filter((e) => ["PAID", "IN_PROGRESS", "COMPLETED"].includes(e.status));

  return (
    <div className="space-y-6">
      <BackLink href="/admin/trips">Trips</BackLink>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <p className="text-sm text-stone-600">
            <span className="tabular-nums">{left} of {plural(trip.totalSpots, "spot")} left · {plural(confirmed.length, "confirmed booking")}</span> ·{" "}
            <a href={`/trips/${trip.slug}`} target="_blank" className="text-teal-700 hover:underline">view on site ↗</a>
          </p>
        </div>
        <Suspense><SavedNotice /></Suspense>
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
                    <div className="text-xs tabular-nums text-stone-600">{plural(e.spots ?? 1, "spot")} · {fmtDateTime(e.createdAt)}</div>
                  </div>
                  <Badge className={statusColor[e.status]}>{statusLabel(e.status)}</Badge>
                </li>
              ))}
              {trip.enquiries.length === 0 && <li className="py-2 text-stone-600">No reservations yet.</li>}
            </ul>
            {trip.enquiries.length > 0 && (
              <a href={`/admin/export?kind=enquiries&trip=${trip.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm text-teal-700 hover:underline">Download traveller list (CSV)</a>
            )}
          </section>

          <form action={deleteTrip.bind(null, trip.id)} className="rounded-xl bg-white p-5 text-sm ring-1 ring-stone-200">
            <h2 className="font-semibold">Remove trip</h2>
            <p className="mt-1 text-stone-600">
              {trip.enquiries.length ? "This trip has reservations, so it will be hidden from the site, not deleted." : "Deletes this trip permanently."}
            </p>
            <SubmitButton
              pendingLabel={trip.enquiries.length ? "Hiding…" : "Deleting…"}
              confirm={trip.enquiries.length
                ? `Hide "${trip.title}" from the website? Its reservations are kept.`
                : `Delete "${trip.title}" permanently? This can't be undone.`}
              className="mt-3 border border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              {trip.enquiries.length ? "Hide trip" : "Delete trip"}
            </SubmitButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
