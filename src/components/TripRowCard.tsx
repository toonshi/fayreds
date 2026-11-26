// OWNER: Faith. Upcoming trip as a wide card: photo left, details and Reserve button right.
import Link from "next/link";
import type { Trip } from "@prisma/client";
import { Price } from "./currency";
import { TripImage } from "./TripImage";
import { Icon } from "./Icon";
import { nights, tripDates } from "./trip-format";

export function TripRowCard({ trip, spotsLeft }: { trip: Trip; spotsLeft: number }) {
  const soldOut = spotsLeft === 0;
  return (
    <article className="group relative grid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-800 sm:grid-cols-[42%_1fr]">
      <div className="img-wipe relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-64">
        <TripImage src={trip.imageUrl} alt={trip.destination} seed={trip.slug} showLabel={false} className="transition-transform duration-700 ease-out group-hover:scale-110" />
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-700"><Icon name="pin" className="h-4 w-4" />{trip.destination}</p>
        <h3 className="mt-1 font-display text-xl font-bold text-stone-900">
          <Link href={`/trips/${trip.slug}`} className="outline-none after:absolute after:inset-0">{trip.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-stone-600">{trip.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-stone-700">
          <li className="flex items-center gap-1.5 tabular-nums"><Icon name="calendar" className="h-4 w-4 text-stone-500" />{tripDates(trip.startDate, trip.endDate)}</li>
          <li className="flex items-center gap-1.5 tabular-nums"><Icon name="moon" className="h-4 w-4 text-stone-500" />{nights(trip.startDate, trip.endDate)} nights</li>
          <li className={`flex items-center gap-1.5 tabular-nums ${spotsLeft <= 3 && !soldOut ? "font-semibold text-rose-700" : ""}`}>
            <Icon name="users" className="h-4 w-4 text-stone-500" />{soldOut ? "Fully booked" : `${spotsLeft} spots left`}
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xs text-stone-500">From, per person</p>
            <Price kes={trip.priceKes} usd={trip.priceUsd} className="text-lg font-bold text-stone-900" />
          </div>
          <span aria-hidden className={`relative z-10 inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold uppercase tracking-wider transition-[background-color,translate] duration-200 group-hover:-translate-y-0.5 ${soldOut ? "bg-stone-200 text-stone-700" : "bg-sun-400 text-brand-950 group-hover:bg-sun-300"}`}>
            {soldOut ? "View" : "Reserve"}
          </span>
        </div>
      </div>
    </article>
  );
}
