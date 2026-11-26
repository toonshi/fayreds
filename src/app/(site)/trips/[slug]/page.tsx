// OWNER: Faith. /trips/[slug]: trip details + reservation form.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTripBySlug, spotsLeft } from "@/lib/trips";
import { siteUrl, whatsappLink } from "@/lib/site";
import { Price, CurrencyToggle } from "@/components/currency";
import { ReservationForm } from "@/components/ReservationForm";
import { TripImage } from "@/components/TripImage";
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

      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
          <Link href="/trips" className="hover:text-stone-900 hover:underline">← All trips</Link>
        </nav>
      </div>

      <header className="mx-auto mt-4 max-w-6xl px-4">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl sm:aspect-[21/9]">
          <TripImage src={trip.imageUrl} alt={trip.destination} seed={trip.slug} />
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-medium text-brand-800">{trip.destination}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-5xl">{trip.title}</h1>
            <p className="mt-2 text-lg text-stone-600">{tripDates(trip.startDate, trip.endDate)} · {n + 1} days, {n} nights</p>
          </div>
          <CurrencyToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-5">
        <div className="space-y-10 lg:col-span-3">
          <section>
            <h2 className="sr-only">About this trip</h2>
            <p className="text-lg leading-relaxed text-stone-700">{trip.summary}</p>
          </section>

          {trip.highlights.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Highlights</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {trip.highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
                    <span aria-hidden className="text-amber-500">★</span><span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trip.includes.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">What&apos;s included</h2>
              <ul className="mt-4 space-y-2">
                {trip.includes.map((x) => (
                  <li key={x} className="flex gap-3"><span aria-hidden className="font-bold text-brand-700">✓</span><span>{x}</span></li>
                ))}
              </ul>
            </section>
          )}

          <section id="reserve" className="scroll-mt-24 rounded-2xl bg-white p-5 ring-1 ring-stone-200 sm:p-8">
            {left > 0 ? (
              <>
                <h2 className="text-2xl font-bold">Reserve your spot</h2>
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

        <aside className="order-first lg:order-none lg:col-span-2">
          <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200 lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-stone-500">Price per person</p>
              <Price kes={trip.priceKes} usd={trip.priceUsd} className="text-3xl font-bold" />
            </div>
            <div className="rounded-xl bg-stone-50 p-4 text-sm">
              <p>Reserve with a deposit of <Price kes={trip.depositKes} usd={trip.depositUsd} className="font-semibold" /> per person.</p>
              <p className="mt-1 text-stone-600">Kenyans pay by M-Pesa, international guests by card.</p>
            </div>
            <p className={`text-sm font-semibold ${left === 0 ? "text-stone-500" : left <= 3 ? "text-rose-700" : "text-brand-800"}`}>
              {left === 0 ? "Fully booked" : `${left} of ${trip.totalSpots} spots left`}
            </p>
            {left > 0 && (
              <a href="#reserve" className="block rounded-full bg-brand-800 px-6 py-3 text-center font-semibold text-white hover:bg-brand-900">Reserve a spot</a>
            )}
            <a href={whatsappLink(`Hi Faith, I have a question about ${trip.title}.`)} target="_blank" rel="noreferrer"
              className="block rounded-full border border-stone-300 px-6 py-3 text-center font-medium hover:bg-stone-50">Ask Faith a question</a>
          </div>
        </aside>
      </div>
    </main>
  );
}

const forms_intro = "Fill in your details, then pay the deposit or the full amount to confirm your place.";
