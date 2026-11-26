// OWNER: Faith. Awards & press: shown on the home and about pages. Content: src/content/recognition.ts
import Image from "next/image";
import { recognition } from "@/content/recognition";

const badge: Record<string, string> = {
  Award: "bg-sun-400 text-brand-950",
  Nomination: "bg-white text-brand-900 ring-1 ring-stone-200",
  Press: "bg-brand-800 text-white",
};

export function Recognition({ headingLevel = 2, tone = "light" }: { headingLevel?: 2 | 3; tone?: "light" | "sand" }) {
  if (recognition.length === 0) return null;
  const H = `h${headingLevel}` as const;
  return (
    <section aria-labelledby="recognition" className={tone === "sand" ? "bg-sand-100 py-16 sm:py-20" : "bg-white py-16 sm:py-20"}>
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Recognition</p>
        <H id="recognition" className="reveal mt-2 max-w-2xl font-display text-3xl font-bold text-balance text-stone-900 sm:text-4xl">
          Awards & press
        </H>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recognition.map((r, i) => (
            <li key={r.image} className="reveal" style={{ ["--i" as string]: i }}>
              <figure className="group h-full overflow-hidden rounded-3xl bg-sand-50 ring-1 ring-stone-200 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-900/10">
                <a href={r.image} target="_blank" rel="noreferrer" className="block overflow-hidden" aria-label={`View full image: ${r.title}`}>
                  <Image
                    src={r.image}
                    alt={r.alt}
                    width={r.width}
                    height={r.height}
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/5] w-full object-cover object-top outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </a>
                <figcaption className="p-5">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[r.kind]}`}>
                    {r.kind === "Nomination" ? "Nominee" : r.kind}{r.year ? ` · ${r.year}` : ""}
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold leading-snug text-pretty text-stone-900">{r.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{r.detail}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
