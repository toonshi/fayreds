"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/trips", label: "Trips" },
  { href: "/about", label: "About" },
  { href: "/marketing", label: "Marketing" },
  { href: "/consultation", label: "Consultation" },
  { href: "/partnership", label: "Partnerships" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [pathname]);

  // The admin panel (Hendy) has its own layout.
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-sand-dark bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href="/" aria-label="Fayreds Travel home" className="shrink-0">
          <Image src="/logo.svg" alt="Fayreds Travel" width={177} height={36} priority unoptimized className="h-9 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-sand ${
                isActive(item.href) ? "text-brand-600" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/consultation"
            className="hidden rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 sm:inline-flex"
          >
            Book a consultation
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-sand md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-sand-dark bg-white px-4 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block rounded-xl px-3 py-3 text-base font-semibold text-ink hover:bg-sand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/consultation"
            className="mt-3 flex w-full justify-center rounded-full bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700"
          >
            Book a consultation
          </Link>
        </nav>
      )}
    </header>
  );
}
