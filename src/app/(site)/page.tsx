// OWNER: Faith. Home page, laid out like a classic holiday site:
// photo hero + trip planner → inspiration tiles → upcoming trips → three services → guides → press → message band.
import Link from "next/link";
import { getPublishedTrips, spotsLeft } from "@/lib/trips";
import { site } from "@/lib/site";
import { HomeHero } from "@/components/HomeHero";
import { InspirationTiles } from "@/components/InspirationTiles";
import { TripRowCard } from "@/components/TripRowCard";
import { VideoGuides } from "@/components/VideoGuides";
import { Recognition } from "@/components/Recognition";
import { MessageBand } from "@/components/MessageBand";
import { Price } from "@/components/currency";
import { Icon, type IconName } from "@/components/Icon";
import { videos } from "@/content/videos";

export const dynamic = "force-dynamic";

const services: { href: string; icon: IconName; title: string; text: string; cta: string; price?: boolean }[] = [
  {
    href: "/consultation", icon: "compass", title: "Travel Consultation",
    text: "A personal plan built around your budget, dates and travel style: where to go, where to stay and what's worth paying for.",
    cta: "Book a consultation", price: true,
  },
  {
    href: "/marketing", icon: "megaphone", title: "Marketing",
    text: "Hotels, restaurants and brands: get in front of people who actually travel, with honest reels, reviews and staycation features.",
    cta: "Work with Faith",
  },
  {
    href: "/partnership", icon: "briefcase", title: "Partnerships",
    text: "Commission-based partnerships for lodges, tour operators and travel brands Faith trusts and recommends to her clients.",
    cta: "Become a partner",
  },
];

function SectionTitle({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div className="reveal text-center">
      <h2 id={id} className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h2>
      <span aria-hidden className="mx-auto mt-4 flex w-max gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-stone-300" /><span className="h-1.5 w-5 rounded-full bg-sun-400" /><span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
      </span>
      {sub && <p className="mx-auto mt-4 max-w-xl text-stone-600">{sub}</p>}
    </div>
  );
}

export default async function HomePage() {
  const trips = (await getPublishedTrips()).slice(0, 4);
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));

  return (
    <main>
      <HomeHero />

      {/* brands and businesses get their own way in, right under the planner */}
      <p className="mx-auto mt-5 max-w-5xl px-4 text-center text-sm text-stone-600">
        Hotel, restaurant or travel brand?{" "}
        <Link href="/marketing" className="inline-flex min-h-11 items-center font-semibold text-brand-800 underline decoration-sun-400 decoration-2 underline-offset-4">Marketing with Faith</Link>
        {" · "}
        <Link href="/partnership" className="inline-flex min-h-11 items-center font-semibold text-brand-800 underline decoration-sun-400 decoration-2 underline-offset-4">Partnerships</Link>
      </p>

      <InspirationTiles />

      {/* ---------- Upcoming trips ---------- */}
      {trips.length > 0 && (
        <section aria-labelledby="trips" className="bg-sand-100 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle id="trips" title="Upcoming group trips" sub="Small groups, places Faith has vetted herself, and everything planned for you." />
            <ul className="mt-12 grid gap-6 lg:grid-cols-2">
              {trips.map((t, i) => (
                <li key={t.id} className="reveal" style={{ ["--i" as string]: i % 2 }}><TripRowCard trip={t} spotsLeft={left[i]} /></li>
              ))}
            </ul>
            <div className="mt-10 text-center">
              <Link href="/trips" className="inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold text-brand-900 ring-1 ring-stone-300 bg-white transition-[background-color,scale] hover:bg-brand-50 active:scale-[0.96]">
                See all trips <Icon name="arrowRight" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- The three ways to work with Faith ---------- */}
      <section aria-labelledby="services" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle id="services" title="Three ways to work with Faith" />
          <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            {services.map((s, i) => (
              <li key={s.href} className="reveal group flex h-full flex-col items-center text-center" style={{ ["--i" as string]: i }}>
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-800 text-white shadow-lg shadow-brand-900/20 ring-8 ring-brand-50 transition-[translate,background-color] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:bg-brand-700">
                  <Icon name={s.icon} className="h-9 w-9" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-bold text-stone-900">{s.title}</h3>
                <p className="mb-6 mt-3 max-w-xs text-stone-600">{s.text}</p>
                {s.price && (
                  <p className="-mt-3 mb-6 text-sm text-stone-600">
                    <Price kes={site.consultation.priceKes} usd={site.consultation.priceUsd} className="font-semibold text-stone-900" /> per consultation
                  </p>
                )}
                <Link href={s.href} className="mt-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-sun-400 px-6 font-semibold text-brand-950 shadow-sm transition-[background-color,translate,box-shadow] hover:-translate-y-0.5 hover:bg-sun-300 hover:shadow-md active:scale-[0.96]">
                  {s.cta} <Icon name="arrowRight" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VideoGuides
        title="Watch Faith's guides"
        intro="Where to eat, where to stay and what to do, filmed on the spot. Tap a video to play it here."
        videos={videos}
        showAllLink
        layout="carousel"
        tone="sand"
      />

      <Recognition />

      <MessageBand />
    </main>
  );
}
