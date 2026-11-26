import { BackLink } from "../../../_components/BackLink";
import { OfferForm } from "../../../_components/OfferForm";

export default function NewOfferPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/admin/offers">Deals</BackLink>
      <h1 className="text-2xl font-bold">New offer</h1>
      <OfferForm />
    </div>
  );
}
