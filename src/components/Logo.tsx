// OWNER: Faith. The Fayreds Travel logo: mark (sun rising over the ocean, with a paper plane) + wordmark.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="4 4 88 88" className={className} aria-hidden focusable="false">
      <rect x="4" y="4" width="88" height="88" rx="24" fill="#6b1c2b" />
      <circle cx="48" cy="54" r="22" fill="#f2a541" />
      <rect x="4" y="56" width="88" height="36" fill="#6b1c2b" />
      <path d="M16 60c8-6 16-6 24 0s16 6 24 0 12-5 16-2" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 74c6-4 12-4 18 0s12 4 18 0" fill="none" stroke="#f5c2c7" strokeWidth="5" strokeLinecap="round" />
      <path d="M58 26l14-6-6 14-3-5z" fill="#fff" />
    </svg>
  );
}

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span translate="no" className="flex flex-col leading-none">
        <span className={`font-display text-2xl font-bold ${light ? "text-white" : "text-brand-800"}`}>Fayreds</span>{" "}
        <span className={`mt-0.5 text-[0.65rem] font-semibold tracking-[0.35em] ${light ? "text-sun-300" : "text-sun-700"}`}>TRAVEL</span>
      </span>
    </span>
  );
}
