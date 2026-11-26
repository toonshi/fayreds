import type { Metadata } from "next";
import FormPage from "@/components/FormPage";

export const metadata: Metadata = {
  title: "Marketing for hotels & travel brands",
  description: "Work with Faith Mutune on reels, TikToks, reviews and campaigns that reach Kenyan and international travellers.",
};

export default function MarketingPage() {
  return (
    <FormPage
      kind="marketing"
      eyebrow="For hotels, restaurants & brands"
      steps={[
        { title: "Tell us about your business", text: "Fill in the form. It takes about 3 minutes." },
        { title: "Instant confirmation", text: "You get a reference by email, and by SMS if you have a Kenyan number." },
        { title: "Faith gets back to you", text: "She reviews every request and replies with ideas and a proposal." },
      ]}
    />
  );
}
