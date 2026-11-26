// OWNER: Faith. /trips: all upcoming published trips.
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedTrips, spotsLeft } from "@/lib/trips";
import { site, siteUrl, whatsappLink } from "@/lib/site";
import { TripCard } from "@/components/TripCard";
import { CurrencyToggle } from "@/components/currency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Upcoming group trips · Fayreds Travel",
  description: "Join Faith on small group trips to Diani, the Maasai Mara, Zanzibar and more. Reserve your spot with a deposit via M-Pesa or card.",
  alternates: { canonical: "/trips" },
};

export default async function TripsPage() {
  const trips = await getPublishedTrips();
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));

  return (
    <main className="bg-sand-50 text-stone-900">
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-800">Travel with Faith</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Upcoming group trips</h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          Small groups, places Faith has vetted herself, and everything planned for you. Reserve with a deposit and
          pay the balance before you go.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-stone-500">Show prices in</span>
          <CurrencyToggle />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16" aria-labelledby="trip-list">
        <h2 id="trip-list" className="sr-only">Trips</h2>
        {trips.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t, i) => (
              <li key={t.id} className="reveal flex" style={{ ["--i" as string]: i % 3 }}><TripCard trip={t} spotsLeft={left[i]} /></li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-200">
            <h2 className="text-xl font-semibold">New trips are coming soon</h2>
            <p className="mt-2 text-stone-600">Follow Faith on Instagram for announcements, or plan your own trip with a consultation.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="rounded-full px-5 py-2.5 font-medium ring-1 ring-stone-300 bg-white transition-[background-color,scale] hover:bg-brand-50 active:scale-[0.96]">Follow on Instagram</a>
              <Link href="/consultation" className="rounded-full bg-brand-800 px-5 py-2.5 font-medium text-white hover:bg-brand-900">Book a consultation</Link>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Travelling as a group or company?</h2>
            <p className="text-stone-600">Faith can plan a private trip around your dates and budget.</p>
          </div>
          <a href={whatsappLink("Hi Faith, I'd like to plan a private group trip.")} target="_blank" rel="noreferrer"
            className="rounded-full bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">Chat on WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
