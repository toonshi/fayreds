// OWNER: Faith. "Get inspired" photo tiles with white label boxes; each opens the matching guides.
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "./Carousel";

const tiles = [
  { label: "Hidden waterfalls", img: "/images/faith-waterfall-pool.webp", pos: "50% 65%", href: "/guides?topic=Do" },
  { label: "Beach escapes", img: "/images/videos/beach-resorts.webp", pos: "50% 40%", href: "/guides?topic=Stay" },
  { label: "Adventures", img: "/images/faith-waterfall-swing.webp", pos: "50% 55%", href: "/guides?topic=Do" },
  { label: "Nairobi food", img: "/images/videos/restaurants-nairobi.webp", pos: "50% 75%", href: "/guides?topic=Eat" },
  { label: "Lakes & water sports", img: "/images/faith-jetski.webp", pos: "45% 62%", href: "/guides?topic=Do" },
  { label: "Luxury stays", img: "/images/videos/luxury-hotels-nairobi.webp", pos: "50% 80%", href: "/guides?topic=Stay" },
  { label: "Nairobi on a budget", img: "/images/videos/affordable-nairobi.webp", pos: "50% 50%", href: "/guides?topic=Budget" },
];

export function InspirationTiles() {
  return (
    <section aria-labelledby="inspired" className="bg-white pb-16 pt-20 sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="reveal text-center">
          <h2 id="inspired" className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">Get inspired</h2>
          <span aria-hidden className="mx-auto mt-4 flex w-max gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-300" /><span className="h-1.5 w-5 rounded-full bg-sun-400" /><span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
          </span>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">Ideas from Faith&apos;s travels around Kenya. Tap one to watch her guides.</p>
        </div>
        <div className="reveal mt-10">
          <Carousel label="Trip ideas" itemClassName="w-[78%] sm:w-[44%] lg:w-[calc((100%-2*1.25rem)/3.15)]">
            {tiles.map((t) => (
              <Link key={t.label} href={t.href} className="group relative block overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-800 focus-visible:ring-offset-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-900">
                  <Image src={t.img} alt="" fill sizes="(min-width: 1024px) 360px, 78vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" style={{ objectPosition: t.pos }} />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                {/* white label box, as in classic holiday sites */}
                <span className="absolute inset-x-6 bottom-6 flex items-center justify-center gap-2 bg-white/95 px-4 py-4 text-center font-display text-lg font-semibold text-stone-900 shadow-lg ring-1 ring-black/5 transition-[translate,background-color] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:bg-white">
                  {t.label}
                </span>
              </Link>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
