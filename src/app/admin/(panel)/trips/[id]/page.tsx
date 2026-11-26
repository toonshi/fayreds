import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { spotsLeft } from "@/lib/trips";
import { StatusLabel } from "../../../_components/StatusLabel";
import { TripForm } from "../../../_components/TripForm";
import { deleteTrip } from "../../../_lib/actions";
import { BackLink } from "../../../_components/BackLink";
import { SavedNotice } from "../../../_components/SavedNotice";
import { SubmitButton } from "../../../_components/SubmitButton";
import { Suspense } from "react";
import { plural, relTime, statusLabel } from "../../../_lib/format";
import { btn, h2 } from "../../../_lib/ui";

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
    <div>
      <BackLink href="/admin/trips">Trips</BackLink>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-balance">{trip.title}</h1>
          <p className="mt-1.5 text-sm text-stone-600">
            <span className="tabular-nums">{left} of {plural(trip.totalSpots, "spot")} left</span>
            <span aria-hidden className="mx-2 text-stone-300">·</span>
            <span className="tabular-nums">{plural(confirmed.length, "confirmed booking")}</span>
            <span aria-hidden className="mx-2 text-stone-300">·</span>
            <a href={`/trips/${trip.slug}`} target="_blank" className="text-brand-700 underline-offset-4 hover:underline">View on site<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        </div>
        <Suspense><SavedNotice /></Suspense>
      </div>

      <div className="mt-12 grid gap-y-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-12">
        <div><TripForm trip={trip} /></div>

        <aside className="space-y-12 lg:border-l lg:border-stone-200 lg:pl-12">
          <section>
            <h2 className={h2}>Travellers</h2>
            <ul className="mt-3 divide-y divide-stone-100 border-y border-stone-100 text-sm">
              {trip.enquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-stone-900 underline-offset-4 hover:text-brand-800 hover:underline">{e.name}</Link>
                    <div className="mt-0.5 text-[13px] text-stone-500 tabular-nums">{plural(e.spots ?? 1, "spot")} · {relTime(e.createdAt)}</div>
                  </div>
                  <StatusLabel status={e.status}>{statusLabel(e.status)}</StatusLabel>
                </li>
              ))}
              {trip.enquiries.length === 0 && <li className="py-3 text-stone-500">No reservations yet.</li>}
            </ul>
            {trip.enquiries.length > 0 && (
              <a href={`/admin/export?kind=enquiries&trip=${trip.id}`} className={`${btn.quiet} mt-2 -ml-3`}>Download traveller list (CSV)</a>
            )}
          </section>

          <form action={deleteTrip.bind(null, trip.id)} className="text-sm">
            <h2 className={h2}>Remove trip</h2>
            <p className="mt-1.5 text-stone-600">
              {trip.enquiries.length ? "This trip has reservations, so it will be hidden from the site, not deleted." : "Deletes this trip permanently."}
            </p>
            <SubmitButton
              pendingLabel={trip.enquiries.length ? "Hiding…" : "Deleting…"}
              confirm={trip.enquiries.length
                ? `Hide "${trip.title}" from the website? Its reservations are kept.`
                : `Delete "${trip.title}" permanently? This can't be undone.`}
              className={`${btn.danger} mt-4`}
            >
              {trip.enquiries.length ? "Hide trip" : "Delete trip"}
            </SubmitButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
