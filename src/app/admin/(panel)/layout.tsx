import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../_lib/actions";
import { NavLink } from "../_components/NavLink";

export const metadata: Metadata = { title: "Admin · Fayreds Travel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    // admin is a work tool: sans-serif headings, even though the public site uses the display face
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 [&_h1]:font-sans [&_h2]:font-sans">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-2 sm:gap-6 sm:px-4">
          <Link href="/admin" className="hidden min-h-11 shrink-0 items-center font-bold text-teal-800 sm:inline-flex">
            Fayreds <span translate="no" className="ml-1 font-normal text-stone-600">Admin</span>
          </Link>
          <nav aria-label="Admin" className="flex flex-1 gap-1 overflow-x-auto py-1 text-sm">
            <NavLink href="/admin" exact>Enquiries</NavLink>
            <NavLink href="/admin/payments">Payments</NavLink>
            <NavLink href="/admin/trips">Trips</NavLink>
            <NavLink href="/admin/offers">Deals</NavLink>
          </nav>
          <div className="flex shrink-0 items-center text-sm">
            <Link href="/" target="_blank" className="hidden min-h-11 items-center px-3 text-stone-600 hover:text-stone-900 sm:inline-flex">View site ↗</Link>
            <form action={logout}>
              <button className="min-h-11 cursor-pointer rounded-md px-3 text-stone-600 hover:bg-stone-100 hover:text-stone-900">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
