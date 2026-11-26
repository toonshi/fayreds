// OWNER: Faith. Home page, designed like a kanga: a printed border (pindo), a centre motif (mji)
// and a saying (jina) on each section.
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
import { Jina } from "@/components/Jina";

export const dynamic = "force-dynamic";

const services = [
  {
    href: "/consultation",
    who: "For travellers",
    title: "Plan my trip",
    text: "A personal plan built around your budget, dates and travel style: where to go, where to stay and what's worth paying for.",
    cta: "Book a consultation",
    price: true,
    card: "bg-clay-600 text-sand-50",
    muted: "text-clay-100",
    button: "bg-sand-50 text-brand-950 hover:bg-white",
    saying: { sw: "Haba na haba hujaza kibaba", en: "Little by little fills the measure: every shilling counts", tone: "black" as const },
  },
  {
    href: "/marketing",
    who: "For hotels, restaurants and brands",
    title: "Feature my business",
    text: "Reels, TikToks and honest reviews that put your stay, table or experience in front of people who actually travel.",
    cta: "Work with Faith",
    card: "bg-brand-950 text-sand-50",
    muted: "text-brand-200",
    button: "bg-clay-600 text-white hover:bg-clay-700",
    saying: { sw: "Mgeni njoo, mwenyeji apone", en: "When the guest arrives, the host prospers", tone: "red" as const },
  },
  {
    href: "/partnership",
    who: "For travel businesses",
    title: "Partner with Faith",
    text: "Commission-based partnerships: Faith recommends and books the partners she trusts for her clients and group trips.",
    cta: "Become a partner",
    card: "bg-sun-400 text-brand-950",
    muted: "text-brand-800",
    button: "bg-brand-950 text-sand-50 hover:bg-brand-800",
    saying: { sw: "Umoja ni nguvu", en: "Unity is strength", tone: "black" as const },
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
      {/* ---------- Hero: Faith's photo framed like a kanga, with a saying underneath ---------- */}
      <section className="mji relative overflow-hidden bg-sand-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <figure className="mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <div className="bg-brand-950 p-2.5 shadow-[10px_10px_0_var(--color-clay-600)] sm:p-3">
              <div aria-hidden className="pindo h-4" />
              <div className="relative my-2.5 aspect-[4/5] overflow-hidden sm:my-3">
                {bio.photo && (
                  <Image src={bio.photo} alt={bio.photoAlt} fill priority sizes="(min-width: 1024px) 520px, 90vw" className="object-cover object-[50%_25%]" />
                )}
              </div>
              <div aria-hidden className="pindo h-4" />
              <figcaption><Jina sw="Safiri salama" en="Travel safely" tone="black" className="pb-1" /></figcaption>
            </div>
          </figure>

          <div>
            <p className="eyebrow text-brand-800">Kenyan travel creator and hospitality insider</p>
            <h1 className="mt-4 text-6xl leading-[0.95] text-brand-950 sm:text-7xl lg:text-8xl">
              <span lang="sw">Safiri na</span> <span className="text-clay-600">Faith.</span>
            </h1>
            <p className="mt-3 font-display text-2xl font-semibold text-brand-800">Travel with Faith.</p>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-700">
              Honest stays, food and experiences from Diani to Zanzibar, personal trip plans that fit your budget, and small group trips with Faith.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/consultation" className="btn-kanga inline-flex min-h-12 items-center justify-center bg-clay-600 px-7 font-semibold text-white hover:bg-clay-700">
                Plan my trip
              </Link>
              <Link href={trips.length ? "/trips" : "#ways"} className="inline-flex min-h-12 items-center justify-center rounded-md px-7 font-semibold text-brand-950 ring-2 ring-brand-950 transition-colors hover:bg-brand-950 hover:text-sand-50">
                {trips.length ? "See upcoming trips" : "Work with Faith"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Proof strip ---------- */}
      {(proof.length > 0 || bio.stats.length > 0) && (
        <section aria-label="Recognition and reach" className="bg-brand-950 text-sand-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-x-10 gap-y-3 px-5 py-5 sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-center">
            {bio.stats.map((s) => (
              <p key={s.label} className="flex items-baseline gap-2"><span className="font-display text-2xl font-bold text-sun-300">{s.value}</span><span className="text-sm text-brand-200">{s.label}</span></p>
            ))}
            {proof.map((p) => (
              <p key={p} className="flex items-center gap-3 text-sm"><span aria-hidden className="h-2 w-2 shrink-0 rotate-45 bg-sun-400" />{p}</p>
            ))}
          </div>
          <div aria-hidden className="pindo h-3" />
        </section>
      )}

      {/* ---------- Three ways to work with Faith: three kanga panels ---------- */}
      <section id="ways" className="scroll-mt-20 py-16 sm:py-24" aria-labelledby="services">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 id="services" className="max-w-2xl text-4xl leading-tight text-brand-950 sm:text-5xl">How can Faith help you?</h2>
          <ul className="mt-10 grid gap-8 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.href} className="flex">
                <div className={`flex flex-1 flex-col border-4 border-brand-950 ${s.card}`}>
                  <div aria-hidden className="pindo h-3" />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className={`text-sm font-semibold ${s.muted}`}>{s.who}</p>
                    <h3 className="mt-2 font-display text-3xl font-bold leading-tight">{s.title}</h3>
                    <p className={`mt-3 leading-relaxed ${s.muted}`}>{s.text}</p>
                    {s.price && (
                      <p className={`mt-4 text-sm ${s.muted}`}>
                        <Price kes={site.consultation.priceKes} usd={site.consultation.priceUsd} className="font-display text-2xl font-bold text-sand-50" /> per consultation
                      </p>
                    )}
                    <div className="mt-auto pt-7">
                      <Link href={s.href} className={`btn-kanga inline-flex min-h-12 w-full items-center justify-center gap-2 px-5 font-semibold ${s.button}`}>
                        {s.cta} <Icon name="arrowRight" />
                      </Link>
                    </div>
                  </div>
                  <Jina {...s.saying} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Upcoming trips: swipe on phones, grid on desktop ---------- */}
      {trips.length > 0 && (
        <section className="border-y-4 border-brand-950 bg-white py-16 sm:py-24" aria-labelledby="trips">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-brand-800">Travel with Faith</p>
                <h2 id="trips" className="mt-3 text-4xl leading-tight text-brand-950 sm:text-5xl">Upcoming group trips</h2>
              </div>
              <Link href="/trips" className="inline-flex min-h-11 items-center gap-1 font-semibold text-clay-700 underline decoration-2 underline-offset-4 hover:text-clay-600">All trips <Icon name="arrowRight" /></Link>
            </div>
          </div>
          <ul className="scrollbar-none mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible">
            {trips.map((t, i) => (
              <li key={t.id} className="flex w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
                <TripCard trip={t} spotsLeft={left[i]} headingLevel={3} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Recognition tone="sand" />

      {/* ---------- How a consultation works ---------- */}
      <section className="bg-brand-950 text-sand-50" aria-labelledby="how">
        <div aria-hidden className="pindo h-4" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
          <h2 id="how" className="max-w-2xl text-4xl leading-tight sm:text-5xl">How a consultation works</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span aria-hidden className="ml-2 flex h-12 w-12 rotate-45 items-center justify-center bg-clay-600">
                  <span className="-rotate-45 font-display text-2xl font-bold">{i + 1}</span>
                </span>
                <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-brand-200">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/consultation" className="btn-kanga mt-12 inline-flex min-h-12 items-center bg-sun-400 px-7 font-semibold text-brand-950 hover:bg-sun-300">
            Start planning
          </Link>
        </div>
        <Jina sw="Mwenda pole hajikwai" en="The one who goes carefully never stumbles" tone="red" />
      </section>

      {/* ---------- Meet Faith ---------- */}
      <section className="py-16 sm:py-24" aria-labelledby="about">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-brand-800">Meet Faith</p>
            <h2 id="about" className="mt-3 text-4xl leading-tight text-brand-950 sm:text-5xl">{bio.headline}</h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-700">{bio.long[0]}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/about" className="inline-flex min-h-11 items-center gap-1 font-semibold text-clay-700 underline decoration-2 underline-offset-4 hover:text-clay-600">More about Faith and FAQs <Icon name="arrowRight" /></Link>
              <SocialIcons />
            </div>
          </div>
          <div className="border-4 border-brand-950 bg-white">
            <Jina sw="Karibu sana" en="You are very welcome" tone="red" />
            <div className="p-7">
              <h3 className="font-display text-2xl font-bold text-brand-950">Questions first?</h3>
              <p className="mt-2 text-brand-700">Send Faith a message. She answers personally.</p>
              <div className="mt-6 grid gap-4">
                <a href={whatsappLink("Hi Faith, I have a question about Fayreds Travel.")} target="_blank" rel="noreferrer"
                  className="btn-kanga inline-flex min-h-12 items-center justify-center bg-sun-400 px-5 font-semibold text-brand-950 hover:bg-sun-300">Chat on WhatsApp</a>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center justify-center rounded-md px-5 font-semibold text-brand-950 ring-2 ring-brand-950 transition-colors hover:bg-brand-950 hover:text-sand-50">
                  Email Faith
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-white py-16 sm:py-24" aria-labelledby="kind-words">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <h2 id="kind-words" className="text-4xl text-brand-950">What travellers and brands say</h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.name}>
                  <figure className="h-full border-l-4 border-clay-600 pl-6">
                    <blockquote className="text-lg leading-relaxed text-brand-950">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-4 text-sm"><span className="font-semibold">{t.name}</span> · <span className="text-brand-600">{t.context}</span></figcaption>
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
