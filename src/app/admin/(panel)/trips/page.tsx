import Link from "next/link";
import { db } from "@/lib/db";
import { spotsLeft } from "@/lib/trips";
import { SubmitButton } from "../../_components/SubmitButton";
import { togglePublished } from "../../_lib/actions";
import { fmtDate, fmtMoney } from "../../_lib/format";
import { btn } from "../../_lib/ui";

export default async function TripsPage() {
  const trips = await db.trip.findMany({ orderBy: { startDate: "asc" } });
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));
  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trips</h1>
          <p className="mt-1.5 text-sm text-stone-600">Live trips show on the website with a Reserve button.</p>
        </div>
        <Link href="/admin/trips/new" className={btn.primary}>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          New trip
        </Link>
      </div>

      {trips.length > 0 ? (
        <ul className="mt-8 border-t border-stone-200">
          {trips.map((t, i) => {
            const past = t.endDate < now;
            const state = past ? "Past" : t.published ? "Live" : "Hidden";
            return (
              <li key={t.id} className="grid gap-x-8 gap-y-3 border-b border-stone-100 py-5 sm:grid-cols-[minmax(0,1fr)_9rem_8rem_auto] sm:items-center">
                <div className="min-w-0">
                  <Link href={`/admin/trips/${t.id}`} className="text-[15px] font-medium text-stone-900 underline-offset-4 hover:text-brand-800 hover:underline">{t.title}</Link>
                  <p className="mt-1 text-sm text-stone-600">
                    {t.destination}<span aria-hidden className="mx-2 text-stone-300">·</span>
                    <span className="tabular-nums">{fmtDate(t.startDate)} – {fmtDate(t.endDate)}</span>
                  </p>
                </div>
                <div className="text-sm tabular-nums">
                  <p className="text-stone-900">{fmtMoney(t.priceKes, "KES")}</p>
                  <p className="text-stone-500">{fmtMoney(t.priceUsd, "USD")}</p>
                </div>
                <p className="text-sm tabular-nums">
                  <span className="font-medium text-stone-900">{left[i]}</span>
                  <span className="text-stone-500"> of {t.totalSpots} spots left</span>
                </p>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${state === "Live" ? "text-stone-800" : "text-stone-500"}`}>
                    <span aria-hidden className={`size-2 rounded-full ${state === "Live" ? "bg-emerald-600" : "bg-stone-300"}`} />
                    {state}
                  </span>
                  {!past && (
                    <form action={togglePublished.bind(null, t.id)}>
                      <SubmitButton pendingLabel={t.published ? "Hiding…" : "Publishing…"} className={btn.quiet}>
                        {t.published ? "Hide" : "Publish"}<span className="sr-only"> {t.title}</span>
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="py-20 text-center">
          <p className="text-[15px] font-medium text-stone-900">No trips yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-stone-500">Create a group trip and it appears on the website, where travellers can reserve a spot and pay a deposit.</p>
          <Link href="/admin/trips/new" className={`${btn.primary} mt-5`}>Create the first trip</Link>
        </div>
      )}
    </div>
  );
}
