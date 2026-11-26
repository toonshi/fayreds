// OWNER: Faith. Full-bleed photo hero (inspired by the classic holiday-site layout):
// desktop = three portrait photos side by side, each slowly zooming; phones = crossfading slideshow.
import Image from "next/image";
import { TripPlanner } from "./TripPlanner";

const photos = [
  { src: "/images/faith-waterfall-pool.webp", alt: "Faith sitting on tree roots beside a turquoise waterfall pool", pos: "50% 70%" },
  { src: "/images/faith-waterfall-swing.webp", alt: "Faith swinging on a rope in front of a tall waterfall", pos: "50% 55%" },
  { src: "/images/faith-jetski.webp", alt: "Faith smiling on a yellow jet ski on a lake", pos: "45% 62%" },
  { src: "/images/faith-portrait.webp", alt: "Faith in a wide-brimmed sun hat at a beachfront table", pos: "50% 35%" },
];

export function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="relative h-[82svh] min-h-[560px] overflow-hidden bg-brand-950 sm:h-[86svh] sm:max-h-[860px]">
        {/* phones: slideshow */}
        <div className="absolute inset-0 sm:hidden">
          {photos.map((p, n) => (
            <div key={p.src} className="hero-slide absolute inset-0 overflow-hidden" style={{ ["--n" as string]: n }} aria-hidden={n > 0}>
              <Image src={p.src} alt={n === 0 ? p.alt : ""} fill priority={n === 0} sizes="100vw" className="object-cover" style={{ objectPosition: p.pos }} />
            </div>
          ))}
        </div>
        {/* larger screens: triptych */}
        <div className="absolute inset-0 hidden grid-cols-3 gap-1 sm:grid">
          {photos.slice(0, 3).map((p, n) => (
            <div key={p.src} className="hero-panel relative overflow-hidden" style={{ ["--n" as string]: n }}>
              <Image src={p.src} alt={p.alt} fill priority sizes="34vw" className="object-cover" style={{ objectPosition: p.pos }} />
            </div>
          ))}
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/60" />

        <div className="intro relative flex h-full flex-col items-center justify-center px-4 pb-24 pt-24 text-center text-white">
          <p style={{ ["--d" as string]: 0 }} className="text-sm font-semibold uppercase tracking-[0.3em] text-sun-300">Faith Mutune · Fayreds Travel</p>
          <h1 id="hero-title" style={{ ["--d" as string]: 1 }}
            className="mt-4 max-w-5xl font-sans text-5xl font-extrabold uppercase leading-[0.95] tracking-tight drop-shadow-[0_2px_20px_rgb(0_0_0/0.35)] sm:text-7xl lg:text-8xl">
            Explore Kenya<br className="hidden sm:block" /> with Faith
          </h1>
          <p style={{ ["--d" as string]: 2 }} className="mt-5 max-w-xl text-lg text-white/90 sm:text-xl">
            Waterfalls, beaches, city stays and hidden gems, planned around your budget by someone who&apos;s been there.
          </p>
        </div>

        {/* slideshow position (phones) */}
        <div aria-hidden className="absolute bottom-24 left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
          {photos.map((p, n) => <span key={p.src} className="hero-dot h-2 w-2 rounded-full bg-white/40" style={{ ["--n" as string]: n }} />)}
        </div>
      </div>

      {/* the planner overlaps the bottom edge of the photo */}
      <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:-mt-12">
        <TripPlanner />
      </div>
    </section>
  );
}
