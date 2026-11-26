// OWNER: Faith. /partnership: commission-based partnerships.
import type { Metadata } from "next";
import { FormPage } from "@/components/FormPage";

export const metadata: Metadata = {
  title: "Partner with Fayreds Travel",
  description: "Commission-based partnerships for hotels, lodges, tour operators and travel brands. Faith recommends and books partners she trusts.",
  alternates: { canonical: "/partnership" },
};

const how = [
  { t: "Faith recommends you", d: "to consultation clients, group trips and her community, when you're the right fit." },
  { t: "Bookings are tracked", d: "with a promo code, a referral link, or bookings Faith makes directly with you." },
  { t: "You pay commission", d: "only on confirmed bookings, at the rate you agree." },
];

export default function PartnershipPage() {
  return (
    <FormPage
      kind="partnership"
      eyebrow="For travel businesses"
      title="Grow with commission-based partnerships"
      submitLabel="Send enquiry"
      footnote="You'll get an SMS (Kenyan numbers) and an email confirming we've received your enquiry."
      steps={[
        "Tell Faith about your company and the offer.",
        "You get an SMS / email confirming your enquiry was received.",
        "Faith reviews it and gets back to you within 2 working days.",
      ]}
    >
      <ul className="mt-6 space-y-3">
        {how.map((h) => (
          <li key={h.t} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <span className="font-semibold text-brand-900">{h.t}</span> <span className="text-stone-700">{h.d}</span>
          </li>
        ))}
      </ul>
    </FormPage>
  );
}
