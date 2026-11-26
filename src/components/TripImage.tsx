// OWNER: Faith. Trip photo, or a warm gradient with the destination name until a photo is added in the admin panel.
const gradients = [
  "from-brand-700 via-brand-600 to-amber-400",
  "from-amber-600 via-orange-500 to-rose-400",
  "from-sky-700 via-cyan-600 to-emerald-400",
  "from-emerald-800 via-lime-700 to-amber-400",
];

export function TripImage({ src, alt, seed, className = "" }: { src?: string | null; alt: string; seed: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- trip photos are external links set by Faith in the admin
    return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  }
  const g = gradients[[...seed].reduce((n, ch) => n + ch.charCodeAt(0), 0) % gradients.length];
  return (
    <div role="img" aria-label={alt} className={`flex h-full w-full items-end bg-gradient-to-br p-5 ${g} ${className}`}>
      <span className="text-2xl font-bold leading-tight text-white/95 drop-shadow">{alt}</span>
    </div>
  );
}
