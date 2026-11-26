// OWNER: Faith. /trips/[slug]: trip details + reservation form.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripBySlug, spotsLeft } from "@/lib/trips";
import { siteUrl, whatsappLink } from "@/lib/site";
import { Price, CurrencyToggle } from "@/components/currency";
import { ReservationForm } from "@/components/ReservationForm";
import { TripImage } from "@/components/TripImage";
import { Icon } from "@/components/Icon";
import { nights, tripDates } from "@/components/trip-format";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const trip = await getTripBySlug((await params).slug);
  if (!trip) return { title: "Trip not found · Fayreds Travel" };
  return {
    metadataBase: new URL(siteUrl()),
    title: `${trip.title}, ${tripDates(trip.startDate, trip.endDate)} · Fayreds Travel`,
    description: trip.summary,
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: { title: trip.title, description: trip.summary, images: trip.imageUrl ? [trip.imageUrl] : undefined },
  };
}

export default async function TripPage({ params }: Params) {
  const trip = await getTripBySlug((await params).slug);
  if (!trip || trip.endDate < new Date()) notFound();
  const left = await spotsLeft(trip.id);
  const n = nights(trip.startDate, trip.endDate);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.summary,
    touristType: "Group travellers",
    itinerary: { "@type": "Place", name: trip.destination },
    offers: [
      { "@type": "Offer", price: trip.priceKes, priceCurrency: "KES", availability: left ? "https://schema.org/InStock" : "https://schema.org/SoldOut", url: siteUrl(`/trips/${trip.slug}`) },
      { "@type": "Offer", price: trip.priceUsd, priceCurrency: "USD", availability: left ? "https://schema.org/InStock" : "https://schema.org/SoldOut", url: siteUrl(`/trips/${trip.slug}`) },
    ],
    provider: { "@type": "Organization", name: "Fayreds Travel", url: siteUrl() },
  };

  return (
    <main className="bg-sand-50 text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Full-width photo with the title on top */}
      <header className="relative isolate overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0 -z-10">
          <TripImage src={trip.imageUrl} alt={trip.destination} seed={trip.slug} priority showLabel={false} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/35 to-brand-950/10" />
        </div>
        <div className="mx-auto flex min-h-[26rem] max-w-6xl flex-col justify-between px-5 pb-10 pt-4 sm:min-h-[32rem] sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm">
            <Link href="/trips" className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-white/90 backdrop-blur hover:bg-white/10"><Icon name="arrowLeft" /> All trips</Link>
          </nav>
          <div>
            <p className="eyebrow text-sun-300">{trip.destination}</p>
            <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">{trip.title}</h1>
            <p className="mt-3 text-lg tabular-nums text-white/85">{tripDates(trip.startDate, trip.endDate)} · {n + 1} days, {n} nights</p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 flex max-w-6xl justify-end px-5 sm:px-6">
        <CurrencyToggle />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-28 pt-6 sm:px-6 lg:grid-cols-5 lg:pb-16">
        <div className="space-y-10 lg:col-span-3">
          <section>
            <h2 className="sr-only">About this trip</h2>
            <p className="text-lg leading-relaxed text-stone-700">{trip.summary}</p>
          </section>

          {trip.highlights.length > 0 && (
            <section>
              <h2 className="text-3xl text-ink">Highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {trip.highlights.map((h) => (
                  <li key={h} className="flex gap-3 border-t border-stone-900/10 py-4">
                    <Icon name="star" className="mt-0.5 h-5 w-5 text-sun-500" /><span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trip.includes.length > 0 && (
            <section>
              <h2 className="text-3xl text-ink">What&apos;s included</h2>
              <ul className="mt-4 space-y-2">
                {trip.includes.map((x) => (
                  <li key={x} className="flex gap-3"><Icon name="check" className="mt-1 h-4 w-4 text-brand-700" /><span>{x}</span></li>
                ))}
              </ul>
            </section>
          )}

          <section id="reserve" className="-mx-5 scroll-mt-24 bg-white px-5 py-8 ring-1 ring-stone-900/10 sm:mx-0 sm:rounded-2xl sm:p-10">
            {left > 0 ? (
              <>
                <h2 className="text-3xl text-ink">Reserve your spot</h2>
                <p className="mt-1 mb-6 text-stone-600">{forms_intro}</p>
                <ReservationForm
                  tripSlug={trip.slug}
                  tripTitle={trip.title}
                  spotsLeft={left}
                  prices={{ priceKes: trip.priceKes, priceUsd: trip.priceUsd, depositKes: trip.depositKes, depositUsd: trip.depositUsd }}
                />
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold">This trip is fully booked</h2>
                <p className="mt-2 text-stone-600">Ask Faith to add you to the waiting list in case a spot opens up.</p>
                <a href={whatsappLink(`Hi Faith, please add me to the waiting list for ${trip.title}.`)} target="_blank" rel="noreferrer"
                  className="mt-5 inline-block rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Join the waiting list on WhatsApp</a>
              </div>
            )}
          </section>
        </div>

        <aside className="hidden lg:col-span-2 lg:block">
          <div className="space-y-4 rounded-2xl bg-white p-7 ring-1 ring-stone-900/10 lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-stone-500">Price per person</p>
              <Price kes={trip.priceKes} usd={trip.priceUsd} className="font-display text-4xl text-ink" />
            </div>
            <div className="rounded-xl bg-sand-50 p-4 text-sm">
              <p>Reserve with a deposit of <Price kes={trip.depositKes} usd={trip.depositUsd} className="font-semibold" /> per person.</p>
              <p className="mt-1 text-stone-600">Kenyans pay by M-Pesa, international guests by card.</p>
            </div>
            <p className={`text-sm font-semibold ${left === 0 ? "text-stone-500" : left <= 3 ? "text-rose-700" : "text-brand-800"}`}>
              {left === 0 ? "Fully booked" : `${left} of ${trip.totalSpots} spots left`}
            </p>
            {left > 0 && (
              <a href="#reserve" className="btn-kanga block bg-clay-600 px-6 py-3 text-center font-semibold text-white hover:bg-clay-700">Reserve a spot</a>
            )}
            <a href={whatsappLink(`Hi Faith, I have a question about ${trip.title}.`)} target="_blank" rel="noreferrer"
              className="block rounded-md px-6 py-3 text-center font-medium ring-2 ring-brand-900 bg-white hover:bg-brand-50">Ask Faith a question</a>
          </div>
        </aside>
      </div>

      {/* Phones: price and Reserve stay on screen while scrolling */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-900/10 bg-white/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <Price kes={trip.priceKes} usd={trip.priceUsd} className="block truncate text-lg font-semibold tabular-nums text-ink" />
            <p className={`text-xs ${left === 0 ? "text-stone-500" : left <= 3 ? "font-semibold text-clay-700" : "text-stone-600"}`}>
              {left === 0 ? "Fully booked" : left <= 3 ? `Only ${left} spot${left === 1 ? "" : "s"} left` : "per person · deposit to reserve"}
            </p>
          </div>
          {left > 0 ? (
            <a href="#reserve" className="btn-kanga inline-flex min-h-12 items-center bg-clay-600 px-6 font-semibold text-white hover:bg-clay-700">Reserve spot</a>
          ) : (
            <a href={whatsappLink(`Hi Faith, please add me to the waiting list for ${trip.title}.`)} target="_blank" rel="noreferrer"
              className="btn-kanga inline-flex min-h-12 items-center bg-sun-400 px-5 font-semibold text-brand-950">Join waiting list</a>
          )}
        </div>
      </div>
    </main>
  );
}

const forms_intro = "Fill in your details, then pay the deposit or the full amount to confirm your place.";
