// OWNER: Faith. Trip photo, or, until Faith adds one in the admin, the logo's "sun over the ocean"
// picture in brand colours (sun height varies per trip so cards don't look identical).
// eslint-disable-next-line @next/next/no-img-element -- trip photos are external links pasted in the admin
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt} />;

export function TripImage({ src, alt, seed, className = "", priority = false, showLabel = true }: {
  src?: string | null; alt: string; seed: string; className?: string; priority?: boolean;
  /** print the destination on the placeholder (cards); off on the trip page where the title is right below */
  showLabel?: boolean;
}) {
  if (src) {
    return (
      <Img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async"
        className={`h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10 ${className}`} />
    );
  }
  const n = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const sunTop = 28 + (n % 4) * 5; // 28–43%
  const sunSize = 30 + (n % 3) * 6; // % of width
  return (
    <div role="img" aria-label={alt} className={`relative h-full w-full overflow-hidden bg-gradient-to-b from-sand-100 via-sun-200 to-sun-300 ${className}`}>
      <div aria-hidden className="absolute left-1/2 aspect-square -translate-x-1/2 rounded-full bg-sun-400" style={{ top: `${sunTop}%`, width: `${sunSize}%` }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[44%] bg-brand-800" />
      <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[30%] h-[12%] w-full">
        <path d="M0 30 C70 5 130 5 200 30 S330 55 400 25" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      </svg>
      {showLabel && <span className="absolute bottom-4 left-5 font-display text-2xl font-bold text-white">{alt}</span>}
    </div>
  );
}
