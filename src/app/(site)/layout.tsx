// OWNER: Faith. Header + footer for every public page.
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SiteHeader />
      <div id="main" tabIndex={-1} className="outline-none">{children}</div>
      <SiteFooter />
    </>
  );
}
