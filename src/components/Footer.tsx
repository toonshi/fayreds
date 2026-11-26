"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site, whatsappLink } from "@/lib/site";
import SocialIcon from "./SocialIcon";

const socials = [
  { name: "instagram", label: "Instagram", href: site.socials.instagram },
  { name: "tiktok", label: "TikTok", href: site.socials.tiktok },
  { name: "facebook", label: "Facebook", href: site.socials.facebook },
] as const;

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-ocean-900 text-ocean-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            <Image src="/logo.svg" alt="Fayreds Travel" width={177} height={36} unoptimized className="h-8 w-auto" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{site.tagline}</p>
          <ul className="mt-5 flex gap-2" aria-label="Social media">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${site.name} on ${s.label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-600"
                >
                  <SocialIcon name={s.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-white">Work with Faith</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white hover:underline" href="/consultation">Book a travel consultation</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/trips">Upcoming trips</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/marketing">Marketing for brands</Link></li>
            <li><Link className="hover:text-white hover:underline" href="/partnership">Partnerships</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a className="flex items-center gap-2 hover:text-white hover:underline" href={`tel:${site.phoneE164}`}>
                <SocialIcon name="phone" className="h-4 w-4" /> {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="flex items-center gap-2 hover:text-white hover:underline" href={whatsappLink("Hi Faith, I found you on your website.")} target="_blank" rel="noopener noreferrer">
                <SocialIcon name="whatsapp" className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a className="flex items-center gap-2 break-all hover:text-white hover:underline" href={`mailto:${site.email}`}>
                <SocialIcon name="mail" className="h-4 w-4" /> {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-ocean-100/80 sm:px-6">
          © {new Date().getFullYear()} {site.name} · {site.owner}
        </p>
      </div>
    </footer>
  );
}
