"use client";
// OWNER: Faith.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { nav } from "./nav";

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-stone-900/10 bg-sand-50/90 backdrop-blur supports-[backdrop-filter]:bg-sand-50/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={`relative inline-flex min-h-11 items-center px-3 text-[0.8rem] font-medium uppercase tracking-[0.14em] transition-colors after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-left after:bg-current after:transition-transform ${active(n.href) ? "text-ink after:scale-x-100" : "text-stone-600 after:scale-x-0 hover:text-ink hover:after:scale-x-100"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/consultation" className="hidden min-h-11 items-center rounded-full bg-clay-600 px-5 text-sm font-semibold text-white transition-[background-color,scale] hover:bg-clay-700 active:scale-[0.96] sm:inline-flex">
            Book a consultation
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-800 hover:bg-stone-100 lg:hidden">
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {/* both icons stay in the DOM and cross-fade */}
            <span aria-hidden className="relative h-6 w-6">
              {[{ d: "M4 7h16M4 12h16M4 17h16", on: !open }, { d: "M6 6l12 12M18 6L6 18", on: open }].map((i) => (
                <svg key={i.d} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={`absolute inset-0 h-6 w-6 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${i.on ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]"}`}>
                  <path d={i.d} />
                </svg>
              ))}
            </span>
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="border-t border-stone-200 bg-sand-50 lg:hidden">
        <ul className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                className={`flex items-center justify-between border-b border-stone-900/10 py-4 font-display text-2xl ${active(n.href) ? "text-clay-700" : "text-ink hover:text-clay-700"}`}>
                {n.label}
              </Link>
            </li>
          ))}
          <li className="pt-6">
            <Link href="/consultation" className="block rounded-full bg-clay-600 px-4 py-3.5 text-center font-semibold text-white transition-[background-color,scale] hover:bg-clay-700 active:scale-[0.96]">Book a consultation</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
