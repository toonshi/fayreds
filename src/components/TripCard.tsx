// OWNER: Faith. Card used on /trips (and later on the home page).
import Link from "next/link";
import type { Trip } from "@prisma/client";
import { Price } from "./currency";
import { TripImage } from "./TripImage";
import { Icon } from "./Icon";
import { nights, tripDates } from "./trip-format";

export function TripCard({ trip, spotsLeft, headingLevel = 3 }: { trip: Trip; spotsLeft: number; headingLevel?: 2 | 3 }) {
  const soldOut = spotsLeft === 0;
  const H = `h${headingLevel}` as const;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-900/10 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-800 has-[a:focus-visible]:ring-offset-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <TripImage src={trip.imageUrl} alt={trip.destination} seed={trip.slug} className="transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${soldOut ? "bg-stone-900/80 text-white" : spotsLeft <= 3 ? "bg-rose-600 text-white" : "bg-white/90 text-stone-800"}`}>
          {soldOut ? "Fully booked" : spotsLeft <= 3 ? `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left` : `${spotsLeft} spots left`}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-medium tabular-nums text-brand-800">{tripDates(trip.startDate, trip.endDate)} · {nights(trip.startDate, trip.endDate)} nights</p>
        <H className="mt-1 font-display text-xl font-bold text-stone-900">
          <Link href={`/trips/${trip.slug}`} className="after:absolute after:inset-0 focus-visible:shadow-none focus-visible:outline-none">
            {trip.title}
          </Link>
        </H>
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{trip.summary}</p>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <p className="text-xs text-stone-500">From, per person</p>
            <Price kes={trip.priceKes} usd={trip.priceUsd} className="text-lg font-bold text-stone-900" />
          </div>
          <span aria-hidden className="inline-flex items-center gap-1 text-sm font-semibold text-brand-800 group-hover:underline">{soldOut ? "View trip" : <>Reserve <span className="transition-transform duration-200 group-hover:translate-x-1"><Icon name="arrowRight" /></span></>}</span>
        </div>
      </div>
    </article>
  );
}
