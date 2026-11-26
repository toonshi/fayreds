// OWNER: Faith. /thank-you?ref=FT-…: shown after the Marketing and Partnership forms.
// The page only reads the reference prefix, so it never reveals anyone's details.
import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank you · Fayreds Travel",
  description: "Your request to Fayreds Travel has been received.",
  robots: { index: false },
};

const copy: Record<string, { what: string; next: string }> = {
  MKT: { what: "marketing request", next: "Faith reviews every request personally and will get back to you within 2 working days with ideas and rates." },
  PRT: { what: "partnership enquiry", next: "Faith will look at your offer and get back to you within 2 working days to talk about how to work together." },
  CON: { what: "consultation request", next: "Faith will be in touch on WhatsApp or email to start planning your trip." },
  TRP: { what: "trip reservation", next: "Faith will be in touch with the trip details and payment schedule." },
};

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const valid = ref && /^FT-[A-Z]{3}-[A-Z0-9]{5}$/.test(ref) ? ref : undefined;
  const c = copy[valid?.slice(3, 6) ?? ""] ?? { what: "message", next: "Faith will get back to you soon." };

  return (
    <main className="flex min-h-[80vh] items-center bg-stone-50 px-4 py-16 text-stone-900">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200 sm:p-12">
        <div aria-hidden className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl text-brand-700">✓</div>
        <h1 className="mt-6 text-3xl font-bold">Thank you, we&apos;ve got it!</h1>
        <p className="mt-3 text-stone-600">Your {c.what} has been received. {c.next}</p>

        {valid && (
          <div className="mx-auto mt-6 inline-block rounded-xl bg-stone-50 px-5 py-3 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-wide text-stone-500">Your reference</p>
            <p className="font-mono text-lg font-semibold tracking-wider">{valid}</p>
          </div>
        )}

        <p className="mt-6 text-sm text-stone-500">
          We&apos;ve sent a confirmation to your email{" "}and, for Kenyan numbers, by SMS. Can&apos;t see the email? Check your spam folder.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={whatsappLink(`Hi Faith, following up on my ${c.what}${valid ? ` (${valid})` : ""}.`)} target="_blank" rel="noreferrer"
            className="rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800">Message Faith on WhatsApp</a>
          <Link href="/" className="rounded-full border border-stone-300 px-6 py-3 font-medium hover:bg-stone-50">Back to home</Link>
        </div>

        <div className="mt-10 border-t border-stone-100 pt-6">
          <p className="text-sm text-stone-500">While you wait, see where Faith is right now</p>
          <ul className="mt-3 flex justify-center gap-5 text-sm font-medium">
            <li><a href={site.socials.instagram} target="_blank" rel="noreferrer" className="text-brand-800 hover:underline">Instagram</a></li>
            <li><a href={site.socials.tiktok} target="_blank" rel="noreferrer" className="text-brand-800 hover:underline">TikTok</a></li>
            <li><a href={site.socials.facebook} target="_blank" rel="noreferrer" className="text-brand-800 hover:underline">Facebook</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
