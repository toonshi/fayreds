// OWNER: Faith. /consultation: paid travel consultation, then WhatsApp/email with Faith.
import type { Metadata } from "next";
import { FormPage } from "@/components/FormPage";
import { Price, CurrencyToggle } from "@/components/currency";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Travel Consultation · Fayreds Travel",
  description: `A personal trip plan from Faith Mutune: destinations, stays, activities and budget tips. US$${site.consultation.priceUsd} or the KES equivalent via M-Pesa.`,
  alternates: { canonical: "/consultation" },
};

export default function ConsultationPage() {
  return (
    <FormPage
      kind="consultation"
      eyebrow="For travellers"
      title="Plan your trip with Faith"
      submitLabel="Continue to payment"
      initialValues={{ adults: "1" }}
      footnote="Kenyans pay by M-Pesa, international clients by card. You'll get an SMS (Kenyan numbers) and an email receipt."
      steps={[
        "Tell Faith about your trip: where, when, budget and what you love.",
        "Pay the consultation fee: M-Pesa (KES) or card (USD).",
        "Continue with Faith on WhatsApp or email and get your personal plan.",
      ]}
    >
      <div className="mt-6 rounded-2xl bg-brand-900 p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-brand-200">Consultation fee</p>
            <Price kes={site.consultation.priceKes} usd={site.consultation.priceUsd} className="font-display text-3xl font-bold" />
          </div>
          <p className="max-w-[12rem] text-right text-sm text-brand-100">Itinerary, stays, activities & budget tips</p>
        </div>
        <CurrencyToggle tone="dark" className="mt-4" />
      </div>
    </FormPage>
  );
}
