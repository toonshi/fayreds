// OWNER: Faith. The Fayreds Travel logo: mark (sun rising over the ocean, with a paper plane) + wordmark.
import { useId } from "react";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const clip = `fm-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="4 4 88 88" className={className} aria-hidden focusable="false">
      <clipPath id={clip}><rect x="4" y="4" width="88" height="88" rx="24" /></clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x="4" y="4" width="88" height="88" fill="#0f4c4a" />
        <circle cx="48" cy="54" r="22" fill="#f2a541" />
        <rect x="4" y="56" width="88" height="36" fill="#0f4c4a" />
        <path d="M16 60c8-6 16-6 24 0s16 6 24 0 12-5 16-2" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 74c6-4 12-4 18 0s12 4 18 0" fill="none" stroke="#7fc9bf" strokeWidth="5" strokeLinecap="round" />
        <path d="M58 26l14-6-6 14-3-5z" fill="#fff" />
      </g>
    </svg>
  );
}

/** "Fayreds Travel" is one name: one line, one typeface, beside the mark. */
export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-10 w-10 shrink-0" />
      <span translate="no" className={`whitespace-nowrap font-display text-[1.35rem] font-bold leading-none tracking-tight sm:text-2xl ${light ? "text-white" : "text-brand-800"}`}>
        Fayreds Travel
      </span>
    </span>
  );
}
