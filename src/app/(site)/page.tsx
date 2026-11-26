// OWNER: Faith. Home page: photo-led hero, proof strip, the three ways to work with Faith,
// upcoming trips, awards & press, how a consultation works, and a short intro to Faith.
import Image from "next/image";
import Link from "next/link";
import { getPublishedTrips, spotsLeft } from "@/lib/trips";
import { site, whatsappLink } from "@/lib/site";
import { bio } from "@/content/bio";
import { testimonials } from "@/content/testimonials";
import { recognition } from "@/content/recognition";
import { TripCard } from "@/components/TripCard";
import { Price } from "@/components/currency";
import { SocialIcons } from "@/components/SocialIcons";
import { Icon } from "@/components/Icon";
import { Recognition } from "@/components/Recognition";

export const dynamic = "force-dynamic";

const services = [
  {
    href: "/consultation",
    who: "For travellers",
    title: "Plan my trip",
    text: "A personal plan built around your budget, dates and travel style: where to go, where to stay and what's worth paying for.",
    cta: "Book a consultation",
    price: true,
  },
  {
    href: "/marketing",
    who: "For hotels, restaurants and brands",
    title: "Feature my business",
    text: "Reels, TikToks and honest reviews that put your stay, table or experience in front of people who actually travel.",
    cta: "Work with Faith",
  },
  {
    href: "/partnership",
    who: "For travel businesses",
    title: "Partner with Faith",
    text: "Commission-based partnerships: Faith recommends and books the partners she trusts for her clients and group trips.",
    cta: "Become a partner",
  },
];

const steps = [
  { title: "Tell Faith about your trip", text: "Destination, dates, budget and what you love. It takes about three minutes." },
  { title: "Pay the consultation fee", text: "M-Pesa for Kenyans, card for international clients, with an SMS and email receipt." },
  { title: "Plan it together", text: "Faith picks it up on WhatsApp or email and builds your plan with you." },
];

/** Short credentials for the strip under the hero, taken from the awards & press list. */
const proof = recognition.map((r) =>
  r.kind === "Press" ? "Featured in People Daily" : r.kind === "Nomination" ? "Travel Creator of the Year nominee" : `Top 100 Most Impactful in African travel${r.year ? `, ${r.year}` : ""}`,
);

export default async function HomePage() {
  const trips = (await getPublishedTrips()).slice(0, 3);
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));

  return (
    <main>
      {/* ---------- Hero: photo first. Phones: photo on top, text below it. Desktop: text panel + photo side by side. ---------- */}
      <section className="relative bg-brand-950 text-white lg:grid lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1fr_1.1fr]">
        <div className="relative h-[58svh] max-h-[36rem] min-h-[24rem] lg:order-2 lg:h-auto lg:max-h-none">
          {bio.photo && (
            <Image src={bio.photo} alt={bio.photoAlt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-[50%_25%]" />
          )}
          {/* fade the bottom of the photo into the dark text panel on phones */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950 to-transparent lg:hidden" />
        </div>

        <div className="relative -mt-10 px-5 pb-12 sm:px-8 lg:mt-0 lg:flex lg:items-center lg:px-12 lg:py-20 xl:px-16">
          <div className="max-w-xl">
            <p className="eyebrow text-sun-300">Kenyan travel creator · Hospitality insider</p>
            <h1 className="mt-4 text-[2.75rem] leading-[1.02] sm:text-6xl xl:text-7xl">
              Travel Kenya and beyond, <em className="text-sun-300">with Faith</em>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-brand-100 sm:text-lg">
              Honest stays, food and experiences from Diani to Zanzibar, plus personal trip plans and small group trips.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/consultation" className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay-600 px-7 font-semibold text-white transition-[background-color,scale] hover:bg-clay-700 active:scale-[0.96]">
                Plan my trip
              </Link>
              <Link href={trips.length ? "/trips" : "#ways"} className="inline-flex min-h-12 items-center justify-center rounded-full px-7 font-semibold text-white ring-1 ring-white/40 transition-[background-color,scale] hover:bg-white/10 active:scale-[0.96]">
                {trips.length ? "See upcoming trips" : "Work with Faith"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Proof strip ---------- */}
      {(proof.length > 0 || bio.stats.length > 0) && (
        <section aria-label="Recognition and reach" className="border-b border-stone-900/10 bg-sand-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-x-10 gap-y-3 px-5 py-6 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-center">
            {bio.stats.map((s) => (
              <p key={s.label} className="flex items-baseline gap-2"><span className="font-display text-2xl text-ink">{s.value}</span><span className="text-sm text-stone-600">{s.label}</span></p>
            ))}
            {proof.map((p) => (
              <p key={p} className="flex items-center gap-2 text-sm text-stone-700"><Icon name="star" className="h-4 w-4 text-sun-500" />{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Three ways to work with Faith ---------- */}
      <section id="ways" className="scroll-mt-20 py-16 sm:py-24" aria-labelledby="services">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <p className="eyebrow text-clay-700">How Faith can help</p>
          <h2 id="services" className="mt-3 max-w-2xl text-4xl leading-tight text-ink sm:text-5xl">Three ways to travel and work with Fayreds</h2>
          <ul className="mt-10 border-t border-stone-900/15">
            {services.map((s, i) => (
              <li key={s.href} className="border-b border-stone-900/15">
                <Link href={s.href} className="group grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:py-9">
                  <span aria-hidden className="font-display text-lg text-stone-400">0{i + 1}</span>
                  <span>
                    <span className="eyebrow block text-stone-500">{s.who}</span>
                    <span className="mt-2 block font-display text-3xl text-ink transition-colors group-hover:text-clay-700 sm:text-4xl">{s.title}</span>
                    <span className="mt-2 block max-w-2xl text-stone-600">{s.text}</span>
                    {s.price && (
                      <span className="mt-3 block text-sm text-stone-600">
                        <Price kes={site.consultation.priceKes} usd={site.consultation.priceUsd} className="font-semibold text-ink" /> per consultation
                      </span>
                    )}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-2 font-semibold text-clay-700 sm:mt-0">
                    {s.cta}
                    <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-clay-200 transition-[background-color,color,translate] group-hover:translate-x-1 group-hover:bg-clay-600 group-hover:text-white">
                      <Icon name="arrowRight" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Upcoming trips: swipe on phones, grid on desktop ---------- */}
      {trips.length > 0 && (
        <section className="bg-white py-16 sm:py-24" aria-labelledby="trips">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-clay-700">Travel with Faith</p>
                <h2 id="trips" className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">Upcoming group trips</h2>
              </div>
              <Link href="/trips" className="inline-flex min-h-11 items-center gap-1 font-semibold text-clay-700 hover:underline">All trips <Icon name="arrowRight" /></Link>
            </div>
          </div>
          <ul className="scrollbar-none mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible">
            {trips.map((t, i) => (
              <li key={t.id} className="flex w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
                <TripCard trip={t} spotsLeft={left[i]} headingLevel={3} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Recognition tone="sand" />

      {/* ---------- How a consultation works ---------- */}
      <section className="bg-brand-950 py-16 text-white sm:py-24" aria-labelledby="how">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <p className="eyebrow text-sun-300">How a consultation works</p>
          <h2 id="how" className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
            From &ldquo;where should I go?&rdquo; to <em className="text-sun-300">a plan you love</em>
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-white/20 pt-6">
                <span aria-hidden className="font-display text-5xl text-sun-300">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-brand-100">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/consultation" className="mt-12 inline-flex min-h-12 items-center rounded-full bg-clay-600 px-7 font-semibold text-white transition-[background-color,scale] hover:bg-clay-700 active:scale-[0.96]">
            Start planning
          </Link>
        </div>
      </section>

      {/* ---------- Meet Faith ---------- */}
      <section className="py-16 sm:py-24" aria-labelledby="about">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-clay-700">Meet Faith</p>
            <h2 id="about" className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">{bio.headline}</h2>
            <p className="mt-6 font-display text-xl leading-relaxed text-stone-700 sm:text-2xl">{bio.long[0]}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/about" className="inline-flex min-h-11 items-center gap-1 font-semibold text-clay-700 hover:underline">More about Faith and FAQs <Icon name="arrowRight" /></Link>
              <SocialIcons />
            </div>
          </div>
          <div className="rounded-2xl bg-white p-7 ring-1 ring-stone-900/10">
            <h3 className="font-display text-2xl text-ink">Questions first?</h3>
            <p className="mt-2 text-stone-600">Send Faith a message. She answers personally.</p>
            <div className="mt-6 grid gap-3">
              <a href={whatsappLink("Hi Faith, I have a question about Fayreds Travel.")} target="_blank" rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-800 px-5 font-semibold text-white transition-[background-color,scale] hover:bg-brand-900 active:scale-[0.96]">Chat on WhatsApp</a>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center justify-center break-all rounded-full px-5 font-semibold text-ink ring-1 ring-stone-300 transition-[background-color,scale] hover:bg-sand-100 active:scale-[0.96]">
                Email Faith
              </a>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-white py-16 sm:py-24" aria-labelledby="kind-words">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <p className="eyebrow text-clay-700">Kind words</p>
            <h2 id="kind-words" className="mt-3 text-4xl text-ink">What travellers and brands say</h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.name}>
                  <figure className="border-t border-stone-900/15 pt-6">
                    <blockquote className="font-display text-xl leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-4 text-sm"><span className="font-semibold">{t.name}</span> · <span className="text-stone-600">{t.context}</span></figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
