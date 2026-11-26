// OWNER: Faith. The Fayreds Travel logo: mark (sun rising over the ocean, with a paper plane) + wordmark.
import Image from "next/image";
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

/** "Fayreds Travel" is one name: one line, one typeface. With `photo`, Faith's profile picture (the one on
 *  all her social accounts) leads, so people recognise her straight away: photo · icon · name. */
export function Logo({ light = false, photo = false, className = "" }: { light?: boolean; photo?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {photo && (
        <Image src="/images/faith-avatar.webp" alt="Faith Mutune" width={44} height={44} priority
          className={`h-9 w-9 shrink-0 rounded-full object-cover ring-2 sm:h-11 sm:w-11 ${light ? "ring-white/90" : "ring-white shadow-sm"}`} />
      )}
      <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span translate="no" className={`whitespace-nowrap font-display text-xl font-bold leading-none tracking-tight sm:text-2xl ${light ? "text-white" : "text-brand-800"}`}>
        Fayreds Travel
      </span>
    </span>
  );
}
