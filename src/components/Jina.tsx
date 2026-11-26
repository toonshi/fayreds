// OWNER: Faith. "Jina": the saying printed on every kanga. A Swahili line with its meaning in English.
// Kanga sayings are traditionally printed in capitals, so the Swahili is uppercase here.
// TODO(Faith): check every saying reads naturally to a Swahili speaker before launch.
export function Jina({ sw, en, tone = "red", className = "" }: { sw: string; en: string; tone?: "red" | "black" | "cream"; className?: string }) {
  const tones = {
    red: "bg-clay-600 text-sand-50",
    black: "bg-brand-950 text-sand-50",
    cream: "bg-sand-50 text-brand-950",
  } as const;
  return (
    <p className={`px-4 py-2.5 text-center ${tones[tone]} ${className}`}>
      <span lang="sw" className="block font-display text-sm font-bold uppercase tracking-[0.08em] sm:text-base">&ldquo;{sw}&rdquo;</span>
      <span className="mt-0.5 block text-xs opacity-85">{en}</span>
    </p>
  );
}
