import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-stone-500 transition-colors duration-150 hover:bg-sand-100 hover:text-stone-900">
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      {children}
    </Link>
  );
}
