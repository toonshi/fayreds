// OWNER: Faith.
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";
import { nav } from "./nav";
import { SocialIcons } from "./SocialIcons";

export function SiteFooter() {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">{site.tagline}</p>
          <SocialIcons tone="light" className="mt-5" />
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-sun-300">Explore</h2>
          <ul className="mt-2 text-sm">
            {nav.map((n) => <li key={n.href}><Link href={n.href} className="inline-flex min-h-11 items-center hover:text-white hover:underline">{n.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-sun-300">Talk to Faith</h2>
          <ul className="mt-2 text-sm">
            <li><a href={whatsappLink("Hi Faith!")} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center tabular-nums hover:text-white hover:underline">WhatsApp {site.phoneDisplay}</a></li>
            <li><a href={`tel:${site.phoneE164}`} className="inline-flex min-h-11 items-center tabular-nums hover:text-white hover:underline">Call {site.phoneDisplay}</a></li>
            <li><a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center break-all hover:text-white hover:underline">{site.email}</a></li>
            <li className="pt-2 text-brand-300">Based in Kenya · working worldwide</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-brand-300">
          © {new Date().getFullYear()} {site.name}. Prices shown in KES for Kenya and USD internationally.
        </p>
      </div>
    </footer>
  );
}
