// OWNER: Faith. Root layout: fonts, site-wide metadata. Header/footer live in app/(site)/layout.tsx
// so the admin panel and payment pages keep their own simpler chrome.
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Fayreds Travel · Travel consultations, group trips & hospitality marketing",
  description: `${site.owner} is a Kenyan travel creator and hospitality insider. Book a personal travel consultation, join a group trip, or work with Faith to market your hotel, restaurant or brand.`,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_KE" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#fbf8f3" }; // matches the sand page background

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
