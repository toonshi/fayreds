// OWNER: Faith. Home page.
import Image from "next/image";
import Link from "next/link";
import { getPublishedTrips, spotsLeft } from "@/lib/trips";
import { site, whatsappLink } from "@/lib/site";
import { bio } from "@/content/bio";
import { testimonials } from "@/content/testimonials";
import { TripCard } from "@/components/TripCard";
import { Price } from "@/components/currency";
import { LogoMark } from "@/components/Logo";
import { SocialIcons } from "@/components/SocialIcons";
import { Icon } from "@/components/Icon";
import { tripDates } from "@/components/trip-format";
import { Recognition } from "@/components/Recognition";
import { VideoGuides } from "@/components/VideoGuides";
import { videos } from "@/content/videos";

export const dynamic = "force-dynamic";

const services = [
  {
    href: "/consultation",
    eyebrow: "For travellers",
    title: "Travel Consultation",
    text: "A personal trip plan built around your budget, dates and travel style: where to go, where to stay and what's worth paying for.",
    points: ["Custom itinerary", "Stays & activities picked for you", "Continue with Faith on WhatsApp or email"],
    cta: "Book a consultation",
    accent: "bg-brand-800 text-white",
    price: true,
  },
  {
    href: "/marketing",
    eyebrow: "For hotels, restaurants & brands",
    title: "Marketing",
    text: "Get your staycation, restaurant, experience or product in front of people who actually travel, with honest content they trust.",
    points: ["Reels, TikToks & stories", "Hosted stay & experience reviews", "Photos & videos for your own pages"],
    cta: "Work with Faith",
    accent: "bg-sun-400 text-brand-950",
  },
  {
    href: "/partnership",
    eyebrow: "For travel businesses",
    title: "Partnerships",
    text: "Commission-based partnerships: Faith recommends and books partners she trusts for her clients, group trips and community.",
    points: ["Commission on confirmed bookings", "Promo codes & referral links", "Co-hosted group trips"],
    cta: "Become a partner",
    accent: "bg-brand-100 text-brand-900",
  },
];

const steps = [
  { title: "Tell Faith about your trip", text: "Destination, dates, budget and what you love. It takes about 3 minutes." },
  { title: "Pay the consultation fee", text: "M-Pesa for Kenyans, card for international clients. You get an SMS and email receipt." },
  { title: "Plan it together", text: "Faith picks it up on WhatsApp or email and builds your plan with you." },
];

export default async function HomePage() {
  const trips = (await getPublishedTrips()).slice(0, 3);
  const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-sun-200/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-20 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-brand-800 ring-1 ring-brand-100">
              <span aria-hidden className="h-2 w-2 rounded-full bg-sun-400" /> Travel creator · Hospitality insider
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-stone-900 sm:text-6xl">
              Travel smarter with <span className="text-brand-800">Faith</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-700">{bio.short}</p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/consultation" className="rounded-full bg-brand-800 px-6 py-3.5 text-center font-semibold text-white shadow-sm transition-[background-color,scale] hover:bg-brand-900 active:scale-[0.96]">
                Travel Consultation
              </Link>
              <Link href="/marketing" className="rounded-full bg-sun-400 px-6 py-3.5 text-center font-semibold text-brand-950 shadow-sm transition-[background-color,scale] hover:bg-sun-300 active:scale-[0.96]">
                Marketing
              </Link>
              <Link href="/partnership" className="rounded-full px-6 py-3.5 text-center font-semibold text-brand-900 ring-1 ring-stone-300 bg-white transition-[background-color,scale] hover:bg-brand-50 active:scale-[0.96]">
                Partnerships
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SocialIcons />
              <span className="text-sm text-stone-600">Follow the journey</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-sun-200 via-sun-300 to-brand-700 shadow-xl">
              {bio.photo ? (
                <Image src={bio.photo} alt={bio.photoAlt} fill priority sizes="(min-width: 1024px) 560px, 90vw"
                  className="object-cover object-[50%_30%]" />
              ) : (
                <>
                  <div aria-hidden className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 rounded-full bg-sun-400" />
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-[48%] bg-brand-800" />
                </>
              )}
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                <p className="text-sm text-stone-600">Next trip</p>
                {trips[0] ? (
                  <>
                    <Link href={`/trips/${trips[0].slug}`} className="font-display text-lg font-semibold text-stone-900 after:absolute after:inset-0 after:rounded-2xl hover:underline">
                      {trips[0].title}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm tabular-nums text-stone-700">
                      <span>{tripDates(trips[0].startDate, trips[0].endDate)}</span>
                      <span aria-hidden>·</span>
                      <span>from <Price kes={trips[0].priceKes} usd={trips[0].priceUsd} className="font-semibold text-stone-900" /></span>
                    </p>
                  </>
                ) : (
                  <p className="font-display text-lg font-semibold">New trips coming soon</p>
                )}
              </div>
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl bg-white p-3 shadow-lg ring-1 ring-stone-100 sm:flex sm:items-center sm:gap-3">
              <LogoMark className="h-10 w-10" />
              <div className="pr-2 text-sm">
                <p className="font-semibold text-stone-900">Top 100 in African travel</p>
                <p className="text-stone-600">Most Impactful People 2025</p>
              </div>
            </div>
          </div>
        </div>

        {bio.stats.length > 0 && (
          <dl className="relative mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-12 sm:grid-cols-4">
            {bio.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <dd className="font-display text-3xl font-bold text-brand-800">{s.value}</dd>
                <dt className="text-sm text-stone-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* ---------- Services: the three main buttons ---------- */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="services">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">What Faith does</p>
          <h2 id="services" className="mt-2 max-w-2xl text-3xl font-bold text-stone-900 sm:text-4xl">Three ways to work with Fayreds Travel</h2>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.href} className="flex">
                <div className="flex flex-1 flex-col rounded-3xl bg-sand-50 p-7 ring-1 ring-stone-200">
                  <p className="text-sm font-medium text-stone-600">{s.eyebrow}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-stone-900">{s.title}</h3>
                  <p className="mt-3 text-stone-700">{s.text}</p>
                  <ul className="mt-5 space-y-2 text-sm text-stone-800">
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-brand-700" />{p}</li>
                    ))}
                  </ul>
                  {s.price && (
                    <p className="mt-5 text-sm text-stone-600">
                      <Price kes={site.consultation.priceKes} usd={site.consultation.priceUsd} className="font-display text-xl font-bold text-stone-900" /> per consultation
                    </p>
                  )}
                  <div className="mt-auto pt-6">
                    <Link href={s.href} className={`block rounded-full px-5 py-3 text-center font-semibold shadow-sm transition-[opacity,scale] hover:opacity-90 active:scale-[0.96] ${s.accent}`}>
                      {s.cta}
                    </Link>
                  </div>
                </div>
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
        tone="sand"
      />

      <Recognition />

      {/* ---------- Upcoming trips ---------- */}
      {trips.length > 0 && (
        <section className="py-16 sm:py-20" aria-labelledby="trips">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Travel with Faith</p>
                <h2 id="trips" className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">Upcoming group trips</h2>
              </div>
              <Link href="/trips" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-800 hover:underline">See all trips <Icon name="arrowRight" /></Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t, i) => <li key={t.id} className="flex"><TripCard trip={t} spotsLeft={left[i]} headingLevel={3} /></li>)}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- How a consultation works ---------- */}
      <section className="bg-brand-900 py-16 text-white sm:py-20" aria-labelledby="how">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-sun-300">How a consultation works</p>
          <h2 id="how" className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">From &ldquo;where should I go?&rdquo; to a plan you&apos;re excited about</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-400 font-bold text-brand-950" aria-hidden>{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-brand-100">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/consultation" className="mt-10 inline-block rounded-full bg-sun-400 px-6 py-3.5 font-semibold text-brand-950 hover:bg-sun-300">
            Start planning
          </Link>
        </div>
      </section>

      {/* ---------- About teaser ---------- */}
      <section className="py-16 sm:py-20" aria-labelledby="about">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Meet Faith</p>
            <h2 id="about" className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">{bio.headline}</h2>
            <p className="mt-4 text-lg leading-relaxed text-stone-700">{bio.long[0]}</p>
            <Link href="/about" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand-800 hover:underline">More about Faith & FAQs <Icon name="arrowRight" /></Link>
          </div>
          <div className="rounded-3xl bg-white p-7 ring-1 ring-stone-200 lg:col-span-2">
            <h3 className="font-display text-xl font-bold text-stone-900">Questions first?</h3>
            <p className="mt-2 text-stone-700">Send Faith a message. She answers personally.</p>
            <div className="mt-5 grid gap-3">
              <a href={whatsappLink("Hi Faith, I have a question about Fayreds Travel.")} target="_blank" rel="noreferrer"
                className="rounded-full bg-emerald-700 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-800">Chat on WhatsApp</a>
              <a href={`mailto:${site.email}`} className="rounded-full px-5 py-3 text-center font-semibold text-brand-900 ring-1 ring-stone-300 bg-white transition-[background-color,scale] hover:bg-brand-50 active:scale-[0.96]">
                Email {site.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-white py-16" aria-labelledby="kind-words">
          <div className="mx-auto max-w-6xl px-4">
            <h2 id="kind-words" className="text-3xl font-bold text-stone-900">Kind words</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.name}>
                  <figure className="h-full rounded-3xl bg-sand-50 p-6 ring-1 ring-stone-200">
                    <blockquote className="text-stone-800">&ldquo;{t.quote}&rdquo;</blockquote>
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
