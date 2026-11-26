import Link from "next/link";
import type { Trip } from "@prisma/client";
import { getPublishedTrips, spotsLeft } from "@/lib/trips";
import { TripCard } from "@/components/TripCard";
import { hero, paths, brands } from "@/content/home";
import { bio } from "@/content/bio";
import { testimonials } from "@/content/testimonials";

// Trips come from the database, so always render fresh.
export const dynamic = "force-dynamic";

async function loadTrips(): Promise<{ trip: Trip; left: number }[]> {
  try {
    const trips = (await getPublishedTrips()).slice(0, 3);
    const left = await Promise.all(trips.map((t) => spotsLeft(t.id)));
    return trips.map((trip, i) => ({ trip, left: left[i] }));
  } catch (e) {
    console.error("[home] could not load trips", e);
    return [];
  }
}

const icons: Record<(typeof paths)[number]["kind"], React.ReactNode> = {
  marketing: <path d="M4 10v4h3l5 4V6L7 10H4zm12-1.5a4 4 0 0 1 0 7M18.5 6a7.5 7.5 0 0 1 0 12" />,
  consultation: <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  partnership: <path d="M8 12l3 3 5-6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />,
};

export default async function Home() {
  const trips = await loadTrips();
  const stats = bio.stats;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sand">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">{hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ocean-900 sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{hero.text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/consultation" className="inline-flex justify-center rounded-full bg-brand-600 px-7 py-3.5 font-bold text-white shadow-sm hover:bg-brand-700">
                Book a consultation
              </Link>
              <Link href="#trips" className="inline-flex justify-center rounded-full border-2 border-ocean-900 px-7 py-3 font-bold text-ocean-900 hover:bg-ocean-900 hover:text-white">
                See upcoming trips
              </Link>
            </div>
          </div>

          {/* Decorative sunset card. TODO(F9): swap for a real photo of Faith in public/images/. */}
          <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-linear-to-b from-brand-200 via-brand-500 to-ocean-700 shadow-xl">
            <div className="absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 rounded-full bg-brand-100/80" />
            <svg viewBox="0 0 400 200" className="absolute bottom-0 w-full" preserveAspectRatio="none">
              <path d="M0 60c50 0 50-20 100-20s50 20 100 20 50-20 100-20 50 20 100 20v140H0z" fill="#185955" />
              <path d="M0 100c50 0 50-18 100-18s50 18 100 18 50-18 100-18 50 18 100 18v100H0z" fill="#0E3533" />
            </svg>
          </div>
        </div>
      </section>

      {/* Three main buttons */}
      <section aria-labelledby="paths-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 id="paths-title" className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">How can Faith help?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {paths.map((p) => (
            <Link
              key={p.kind}
              href={p.href}
              className="group flex flex-col rounded-card border border-sand-dark bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {icons[p.kind]}
                </svg>
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ocean-900">{p.title}</h3>
              <p className="mt-1 text-sm font-semibold text-brand-600">{p.who}</p>
              <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{p.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-ocean-900 group-hover:text-brand-600">
                {p.cta} <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bio */}
      <section aria-labelledby="bio-title" className="bg-ocean-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr] md:py-20">
          <h2 id="bio-title" className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">{bio.headline}</h2>
          <div className="text-lg leading-relaxed text-ink-muted">
            <p>{bio.short}</p>
            <Link href="/about" className="mt-4 inline-block font-bold text-brand-600 hover:underline">More about Faith →</Link>
          </div>
        </div>
      </section>

      {/* Upcoming trips */}
      <section id="trips" aria-labelledby="trips-title" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="trips-title" className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">Upcoming trips</h2>
            <p className="mt-2 text-ink-muted">Travel with Faith and a small group. Reserve with a deposit.</p>
          </div>
          <Link href="/trips" className="font-bold text-brand-600 hover:underline">All trips →</Link>
        </div>
        {trips.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map(({ trip, left }) => <TripCard key={trip.id} trip={trip} spotsLeft={left} />)}
          </div>
        ) : (
          <p className="mt-8 rounded-card bg-sand p-6 text-ink-muted">
            New trips are coming soon. Follow Faith on Instagram to hear first, or <Link href="/consultation" className="font-semibold text-brand-600 underline">book a consultation</Link> to plan your own.
          </p>
        )}
      </section>

      {/* Social proof: hidden until real numbers / brands are added in content files */}
      {(stats.length > 0 || brands.length > 0) && (
      <section aria-labelledby="proof-title" className="bg-ocean-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="proof-title" className="sr-only">Faith&apos;s reach</h2>
          {stats.length > 0 && (
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col text-center">
                <dt className="text-sm text-ocean-100">{s.label}</dt>
                <dd className="order-first font-display text-4xl font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
          )}
          {brands.length > 0 && (
          <>
          <p className="mt-12 text-center text-sm font-semibold uppercase tracking-widest text-ocean-100">Brands Faith has worked with</p>
          <ul className="mt-5 flex flex-wrap justify-center gap-3">
            {brands.map((b) => (
              <li key={b} className="rounded-full border border-white/20 px-4 py-2 text-sm">{b}</li>
            ))}
          </ul>
          </>
          )}
        </div>
      </section>
      )}

      {/* Testimonials: hidden until there are real ones */}
      {testimonials.length > 0 && (
      <section aria-labelledby="reviews-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 id="reviews-title" className="font-display text-3xl font-semibold text-ocean-900 sm:text-4xl">What people say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-card bg-sand p-6">
              <blockquote className="flex-1 leading-relaxed text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-bold text-ocean-900">{t.name}</span>
                <span className="text-ink-muted"> · {t.context}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      )}

      {/* Final call to action */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready for your next trip?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">Tell Faith where you want to go and she&apos;ll put together a plan that fits you.</p>
          <Link href="/consultation" className="mt-7 inline-flex rounded-full bg-white px-7 py-3.5 font-bold text-brand-700 hover:bg-brand-50">
            Book a consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
