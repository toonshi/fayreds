// OWNER: Faith. Trip card used on /trips and the home page: tall photo, then dates, title and price.
import Link from "next/link";
import type { Trip } from "@prisma/client";
import { Price } from "./currency";
import { TripImage } from "./TripImage";
import { Icon } from "./Icon";
import { nights, tripDates } from "./trip-format";

export function TripCard({ trip, spotsLeft, headingLevel = 3 }: { trip: Trip; spotsLeft: number; headingLevel?: 2 | 3 }) {
  const soldOut = spotsLeft === 0;
  const few = !soldOut && spotsLeft <= 3;
  const H = `h${headingLevel}` as const;
  return (
    <article className="group relative flex w-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand-100 group-has-[a:focus-visible]:ring-2 group-has-[a:focus-visible]:ring-brand-800 group-has-[a:focus-visible]:ring-offset-2">
        <TripImage src={trip.imageUrl} alt={trip.destination} seed={trip.slug} className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
          soldOut ? "bg-ink/80 text-white" : few ? "bg-clay-600 text-white" : "bg-white/90 text-ink"}`}>
          {soldOut ? "Fully booked" : few ? `Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left` : `${spotsLeft} spots left`}
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow tabular-nums text-stone-500">{tripDates(trip.startDate, trip.endDate)} · {nights(trip.startDate, trip.endDate)} nights</p>
        <H className="mt-2 font-display text-2xl leading-tight text-ink">
          <Link href={`/trips/${trip.slug}`} className="after:absolute after:inset-0 focus-visible:shadow-none focus-visible:outline-none">
            {trip.title}
          </Link>
        </H>
        <p className="mt-1 text-sm text-stone-600">{trip.destination}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-sm text-stone-600">
            From <Price kes={trip.priceKes} usd={trip.priceUsd} className="font-semibold text-ink" />
          </p>
          <span aria-hidden className="inline-flex items-center gap-1 text-sm font-semibold text-clay-700 transition-transform group-hover:translate-x-0.5">
            {soldOut ? "View trip" : <>Reserve <Icon name="arrowRight" /></>}
          </span>
        </div>
      </div>
    </article>
  );
}
