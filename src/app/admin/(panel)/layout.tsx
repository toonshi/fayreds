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
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-bold text-teal-800">Fayreds Admin</Link>
          <nav className="flex flex-1 gap-1 text-sm">
            <NavLink href="/admin" exact>Enquiries</NavLink>
            <NavLink href="/admin/payments">Payments</NavLink>
            <NavLink href="/admin/trips">Trips</NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" className="text-stone-500 hover:text-stone-900">View site ↗</Link>
            <form action={logout}>
              <button className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
