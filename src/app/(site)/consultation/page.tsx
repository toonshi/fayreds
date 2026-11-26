import type { Metadata } from "next";
import FormPage from "@/components/FormPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a travel consultation",
  description: "Get a personal trip plan from Faith Mutune: where to go, where to stay and how to make your budget go further.",
};

export default function ConsultationPage() {
  const { priceKes, priceUsd } = site.consultation;
  return (
    <FormPage
      kind="consultation"
      eyebrow="Personal trip planning"
      steps={[
        { title: "Tell Faith about your trip", text: "Where, when, who's going and your budget." },
        { title: "Pay the consultation fee", text: "M-Pesa for Kenyan clients, card for everyone else." },
        { title: "Plan together", text: "Continue with Faith on WhatsApp or email and get your trip plan." },
      ]}
      aside={
        <div className="mt-6 rounded-xl bg-white p-4">
          <p className="text-sm text-ink-muted">Consultation fee</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ocean-900">KES {priceKes.toLocaleString("en-KE")}</p>
          <p className="text-sm text-ink-muted">or ${priceUsd} for international clients</p>
        </div>
      }
    />
  );
}
