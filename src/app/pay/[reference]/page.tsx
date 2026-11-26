// OWNER: Mike. PLACEHOLDER so the frontend redirect works today.
// TODO(Mike): M-Pesa STK push for Kenyans, Stripe card for international, waiting state,
// then "Continue on WhatsApp / by email" after a consultation is paid.
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { quoteFor, formatMoney } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const enquiry = await db.enquiry.findUnique({ where: { reference }, include: { trip: true } });
  if (!enquiry || !["CONSULTATION", "RESERVATION"].includes(enquiry.type)) notFound();
  const quote = quoteFor(enquiry);

  return (
    <main className="mx-auto max-w-lg p-8">
      <p className="text-sm text-gray-500">Reference {enquiry.reference}</p>
      <h1 className="mt-2 text-2xl font-bold">{quote.label}</h1>
      <p className="mt-4 text-3xl font-semibold">{formatMoney(quote)}</p>
      <p className="mt-6 rounded-lg bg-amber-50 p-4 text-amber-900">
        Online payment is coming soon ({quote.currency === "KES" ? "M-Pesa" : "card"}).
      </p>
    </main>
  );
}
