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
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-6 sm:pt-20">
        <p className="eyebrow text-clay-700">Travel with Faith</p>
        <h1 className="mt-3 max-w-2xl text-5xl leading-[1.05] text-ink sm:text-6xl">Upcoming group trips</h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-600">
          Small groups, places Faith has vetted herself, and everything planned for you. Reserve with a deposit and
          pay the balance before you go.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-stone-500">Show prices in</span>
          <CurrencyToggle />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6" aria-labelledby="trip-list">
        <h2 id="trip-list" className="sr-only">Trips</h2>
        {trips.length > 0 ? (
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t, i) => (
              <li key={t.id} className="flex"><TripCard trip={t} spotsLeft={left[i]} /></li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-stone-900/10 sm:p-14">
            <h2 className="text-3xl text-ink">New trips are coming soon</h2>
            <p className="mt-2 text-stone-600">Follow Faith on Instagram for announcements, or plan your own trip with a consultation.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="rounded-md px-5 py-2.5 font-medium ring-2 ring-brand-900 bg-white hover:bg-brand-50">Follow on Instagram</a>
              <Link href="/consultation" className="btn-kanga bg-clay-600 px-5 py-2.5 font-semibold text-white hover:bg-clay-700">Book a consultation</Link>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-12 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-3xl text-ink">Travelling as a group or company?</h2>
            <p className="text-stone-600">Faith can plan a private trip around your dates and budget.</p>
          </div>
          <a href={whatsappLink("Hi Faith, I'd like to plan a private group trip.")} target="_blank" rel="noreferrer"
            className="btn-kanga bg-sun-400 px-5 py-2.5 font-semibold text-brand-950 hover:bg-sun-300">Chat on WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
