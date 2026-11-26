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
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-sand-50/90 backdrop-blur supports-[backdrop-filter]:bg-sand-50/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${active(n.href) ? "bg-brand-100 text-brand-900" : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/consultation" className="hidden rounded-full bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 sm:inline-block">
            Book a consultation
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-800 hover:bg-stone-100 lg:hidden">
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="border-t border-stone-200 bg-sand-50 lg:hidden">
        <ul className="mx-auto max-w-6xl space-y-1 px-4 py-4">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 text-base font-medium ${active(n.href) ? "bg-brand-100 text-brand-900" : "text-stone-800 hover:bg-stone-100"}`}>
                {n.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/consultation" className="block rounded-full bg-brand-800 px-4 py-3 text-center font-semibold text-white">Book a consultation</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
