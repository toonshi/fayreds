"use client";
// OWNER: Faith. Links split around a centred logo. On the home page it floats transparent over the
// hero photos and turns solid once you scroll; everywhere else it's a solid sticky bar.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { nav } from "./nav";

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = path === "/";

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll); };
  }, []);

  const overlay = home && !scrolled && !open;
  const active = (href: string) => path === href || path.startsWith(href + "/");
  const left = nav.slice(0, 3);
  const right = nav.slice(3);

  const linkCls = (href: string) =>
    `inline-flex min-h-11 items-center rounded-full px-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
      overlay
        ? active(href) ? "text-white underline decoration-sun-400 decoration-2 underline-offset-8" : "text-white/90 hover:text-white"
        : active(href) ? "text-brand-900 underline decoration-sun-400 decoration-2 underline-offset-8" : "text-stone-700 hover:text-brand-900"
    }`;

  return (
    <header className={`${home ? "fixed" : "sticky"} inset-x-0 top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
      overlay ? "border-b border-transparent bg-transparent" : "border-b border-stone-200/70 bg-sand-50/95 shadow-sm shadow-black/[0.03] backdrop-blur supports-[backdrop-filter]:bg-sand-50/85"}`}>
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5">
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {left.map((n) => <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={linkCls(n.href)}>{n.label}</Link></li>)}
          </ul>
        </nav>
        {/* phones: menu button on the left keeps the logo centred */}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav"
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${overlay ? "text-white hover:bg-white/10" : "text-stone-800 hover:bg-stone-100"}`}>
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="relative h-6 w-6">
            {[{ d: "M4 7h16M4 12h16M4 17h16", on: !open }, { d: "M6 6l12 12M18 6L6 18", on: open }].map((i) => (
              <svg key={i.d} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={`absolute inset-0 h-6 w-6 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${i.on ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]"}`}>
                <path d={i.d} />
              </svg>
            ))}
          </span>
        </button>

        <Link href="/" className="justify-self-center rounded-lg">
          <Logo light={overlay} />
        </Link>

        <div className="flex items-center justify-end gap-1">
          <nav aria-label="More" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {right.map((n) => <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={linkCls(n.href)}>{n.label}</Link></li>)}
            </ul>
          </nav>
          <Link href="/consultation"
            className={`ml-1 hidden min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color,scale] active:scale-[0.96] sm:inline-flex ${
              overlay ? "bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white hover:text-brand-900" : "bg-brand-800 text-white hover:bg-brand-900"}`}>
            Book
            <span className="sr-only"> a consultation</span>
          </Link>
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
            <Link href="/consultation" className="block rounded-full bg-brand-800 px-4 py-3.5 text-center font-semibold text-white transition-[background-color,scale] active:scale-[0.96]">Book a consultation</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
