"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, exact, count, children }: { href: string; exact?: boolean; count?: number; children: React.ReactNode }) {
  const path = usePathname();
  const active = exact ? path === href || path.startsWith("/admin/enquiries") : path.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-14 shrink-0 items-center gap-2 px-1 text-sm transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full ${
        active ? "font-medium text-stone-900 after:bg-brand-800" : "text-stone-500 hover:text-stone-900"
      }`}
    >
      {children}
      {!!count && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-800 px-1.5 text-xs font-medium tabular-nums text-white">
          {count}<span className="sr-only"> need a reply</span>
        </span>
      )}
    </Link>
  );
}
