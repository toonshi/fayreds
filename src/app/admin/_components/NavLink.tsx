"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, exact, children }: { href: string; exact?: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const active = exact ? path === href || path.startsWith("/admin/enquiries") : path.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 ${active ? "bg-teal-50 font-semibold text-teal-800" : "text-stone-600 hover:bg-stone-100"}`}
    >
      {children}
    </Link>
  );
}
