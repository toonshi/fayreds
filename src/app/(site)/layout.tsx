// OWNER: Faith. Header + footer for every public page, and the visitor's currency (from a cookie).
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CURRENCY_COOKIE, CurrencyProvider, type Currency } from "@/components/currency";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(CURRENCY_COOKIE)?.value;
  const initial: Currency | null = saved === "KES" || saved === "USD" ? saved : null;
  return (
    <CurrencyProvider initial={initial}>
      <a href="#main" className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteHeader />
      <div id="main" tabIndex={-1} className="outline-none">{children}</div>
      <SiteFooter />
    </CurrencyProvider>
  );
}
