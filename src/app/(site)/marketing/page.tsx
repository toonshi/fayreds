// OWNER: Faith. /marketing: hotels, restaurants, activities & brands.
import type { Metadata } from "next";
import { FormPage } from "@/components/FormPage";

export const metadata: Metadata = {
  title: "Marketing with Faith · Fayreds Travel",
  description: "Hotels, staycations, restaurants, tour operators and brands: reach Faith's travel community with reels, TikToks, hosted stays and honest reviews.",
  alternates: { canonical: "/marketing" },
};

const offer = ["Instagram reels, posts & stories", "TikTok videos", "Staycation & hosted-stay reviews", "Restaurant & experience features", "Event coverage", "Photos & videos for your own pages", "Brand ambassadorships"];

export default function MarketingPage() {
  return (
    <FormPage
      kind="marketing"
      eyebrow="For hotels, restaurants & brands"
      title="Put your place in front of real travellers"
      submitLabel="Send request"
      footnote="You'll get an SMS (Kenyan numbers) and an email confirming we've received your request."
      steps={[
        "Tell Faith about your business and what you have in mind.",
        "You get an SMS / email confirming your request was received.",
        "Faith replies within 2 working days with ideas, dates and rates.",
      ]}
    >
      <ul className="mt-6 flex flex-wrap gap-2">
        {offer.map((o) => <li key={o} className="rounded-full bg-sun-100 px-3 py-1.5 text-sm font-medium text-sun-700">{o}</li>)}
      </ul>
    </FormPage>
  );
}
