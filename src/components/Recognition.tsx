// OWNER: Faith. Awards & press: shown on the home and about pages. Content: src/content/recognition.ts
import Image from "next/image";
import { recognition } from "@/content/recognition";

const badge: Record<string, string> = {
  Award: "text-clay-700",
  Nomination: "text-brand-800",
  Press: "text-stone-600",
};

export function Recognition({ headingLevel = 2, tone = "light" }: { headingLevel?: 2 | 3; tone?: "light" | "sand" }) {
  if (recognition.length === 0) return null;
  const H = `h${headingLevel}` as const;
  return (
    <section aria-labelledby="recognition" className={tone === "sand" ? "bg-sand-100 py-16 sm:py-20" : "bg-white py-16 sm:py-20"}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <p className="eyebrow text-brand-800">Recognition</p>
        <H id="recognition" className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-balance text-brand-950 sm:text-5xl">
          Awards & press
        </H>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recognition.map((r) => (
            <li key={r.image}>
              <figure className="group h-full">
                <a href={r.image} target="_blank" rel="noreferrer" className="block overflow-hidden border-4 border-brand-950" aria-label={`View full image: ${r.title}`}>
                  <Image
                    src={r.image}
                    alt={r.alt}
                    width={r.width}
                    height={r.height}
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/5] w-full object-cover object-top outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </a>
                <figcaption className="pt-4">
                  <span className={`eyebrow ${badge[r.kind]}`}>
                    {r.kind === "Nomination" ? "Nominee" : r.kind}{r.year ? ` · ${r.year}` : ""}
                  </span>
                  <p className="mt-2 font-display text-xl font-bold leading-snug text-pretty text-brand-950">{r.title}</p>
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
