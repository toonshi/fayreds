// OWNER: Faith. Simple icon links to Faith's social accounts.
import { site } from "@/lib/site";

const icons = {
  Instagram: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM16.5 2h-9A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2zm3.7 14.5a3.7 3.7 0 0 1-3.7 3.7h-9a3.7 3.7 0 0 1-3.7-3.7v-9a3.7 3.7 0 0 1 3.7-3.7h9a3.7 3.7 0 0 1 3.7 3.7z",
  TikTok: "M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2-2.8V9a6.3 6.3 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.4 1.4V6.7a4.6 4.6 0 0 1-4.4-4.7z",
  Facebook: "M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.3 2 10.5 3.8 10.5 6v2H8v3.2h2.5V22H14V11.2h2.6L17 8z",
} as const;

export function SocialIcons({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const links = [
    { name: "Instagram", href: site.socials.instagram },
    { name: "TikTok", href: site.socials.tiktok },
    { name: "Facebook", href: site.socials.facebook },
  ] as const;
  return (
    <ul className={`flex gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.name}>
          <a href={l.href} target="_blank" rel="noreferrer" aria-label={`Faith on ${l.name}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${tone === "light" ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-brand-800 ring-1 ring-stone-200 hover:bg-brand-50"}`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d={icons[l.name]} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
