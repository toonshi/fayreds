import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "../_lib/actions";
import { NavLink } from "../_components/NavLink";

export const metadata: Metadata = { title: "Admin · Fayreds Travel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const needReply = await db.enquiry.count({ where: { status: "NEW" } });
  return (
    // admin is a work tool: one sans family throughout, even though the public site uses a display serif
    <div className="min-h-screen bg-white font-sans text-stone-900 antialiased [&_h1]:font-sans [&_h2]:font-sans [&_h1]:tracking-tight">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 sm:gap-10 sm:px-8">
          <Link href="/admin" className="hidden shrink-0 text-[15px] font-semibold text-brand-900 sm:block">Fayreds</Link>
          <nav aria-label="Admin" className="flex flex-1 gap-6 overflow-x-auto">
            <NavLink href="/admin" exact count={needReply}>Enquiries</NavLink>
            <NavLink href="/admin/payments">Payments</NavLink>
            <NavLink href="/admin/trips">Trips</NavLink>
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/" target="_blank" className="hidden h-9 items-center rounded-lg px-3 text-sm text-stone-500 transition-colors duration-150 hover:bg-sand-100 hover:text-stone-900 sm:inline-flex">
              View site<span className="sr-only"> (opens in a new tab)</span>
            </Link>
            <form action={logout}>
              <button className="h-9 rounded-lg px-3 text-sm text-stone-500 transition-colors duration-150 hover:bg-sand-100 hover:text-stone-900">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main id="admin-main" className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-8 sm:pt-10">{children}</main>
    </div>
  );
}
