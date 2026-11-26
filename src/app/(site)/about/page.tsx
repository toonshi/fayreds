// OWNER: Faith. /about: bio, testimonials (when there are real ones) and FAQ.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site, siteUrl, whatsappLink } from "@/lib/site";
import { bio } from "@/content/bio";
import { testimonials } from "@/content/testimonials";
import { faqs } from "@/content/faq";
import { Recognition } from "@/components/Recognition";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "About Faith · Fayreds Travel",
  description: "Faith Mutune is a Kenyan travel creator and hospitality insider. Travel consultations, group trips and hospitality marketing.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((t) => t.items).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <main className="bg-sand-50 text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />

      <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-800">About</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{bio.headline}</h1>
            <p className="mt-4 text-xl text-pretty text-stone-700">{bio.short}</p>
          </div>
          {bio.photo && (
            <Image src={bio.photo} alt={bio.photoAlt} width={1280} height={1280} priority sizes="(min-width: 768px) 360px, 90vw"
              className="aspect-square w-full rounded-[2rem] object-cover outline outline-1 -outline-offset-1 outline-black/10 shadow-xl md:col-span-2" />
          )}
        </div>
        <div className="mt-10 max-w-3xl space-y-4 text-lg leading-relaxed text-pretty text-stone-700">
          {bio.long.map((p) => <p key={p}>{p}</p>)}
        </div>

        {bio.stats.length > 0 && (
          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {bio.stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                <dd className="text-3xl font-bold text-brand-800">{s.value}</dd>
                <dt className="text-sm text-stone-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/consultation" className="rounded-full bg-brand-800 px-5 py-2.5 font-semibold text-white hover:bg-brand-900">Book a consultation</Link>
          <Link href="/trips" className="rounded-full border border-stone-300 bg-white px-5 py-2.5 font-medium hover:bg-stone-50">See upcoming trips</Link>
          <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 bg-white px-5 py-2.5 font-medium hover:bg-stone-50">Instagram</a>
          <a href={site.socials.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 bg-white px-5 py-2.5 font-medium hover:bg-stone-50">TikTok</a>
        </div>
      </section>

      <Recognition headingLevel={2} />

      {testimonials.length > 0 && (
        <section className="bg-white py-14" aria-labelledby="kind-words">
          <div className="mx-auto max-w-5xl px-4">
            <h2 id="kind-words" className="text-2xl font-bold">Kind words</h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {testimonials.map((t) => (
                <li key={t.name}>
                  <figure className="h-full rounded-2xl bg-stone-50 p-6 ring-1 ring-stone-200">
                    <blockquote className="text-stone-800">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-4 text-sm"><span className="font-semibold">{t.name}</span> · <span className="text-stone-500">{t.context}</span></figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-14" aria-labelledby="faq">
        <h2 id="faq" className="text-3xl font-bold">Questions people ask</h2>
        {faqs.map((topic) => (
          <div key={topic.topic} className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-800">{topic.topic}</h3>
            <div className="mt-3 divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
              {topic.items.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {f.q}
                    <span aria-hidden className="text-xl text-stone-400 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-stone-700">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        <p className="mt-10 text-stone-600">
          Something else?{" "}
          <a href={whatsappLink("Hi Faith, I have a question.")} target="_blank" rel="noreferrer" className="font-semibold text-brand-800 underline">Ask on WhatsApp</a>{" "}
          or email <a href={`mailto:${site.email}`} className="font-semibold text-brand-800 underline">{site.email}</a>.
        </p>
      </section>
    </main>
  );
}
