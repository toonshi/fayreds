import type { Metadata } from "next";
import FormPage from "@/components/FormPage";

export const metadata: Metadata = {
  title: "Partner with Fayreds Travel",
  description: "Commission-based partnerships for hotels, lodges, tour operators and travel brands.",
};

export default function PartnershipPage() {
  return (
    <FormPage
      kind="partnership"
      eyebrow="Commission-based partnerships"
      steps={[
        { title: "Share your offer", text: "Tell us about your company, rates and the commission you offer." },
        { title: "Instant confirmation", text: "You get a reference by email, and by SMS if you have a Kenyan number." },
        { title: "Let's talk terms", text: "Faith reviews every offer and contacts partners that fit her clients." },
      ]}
    />
  );
}
