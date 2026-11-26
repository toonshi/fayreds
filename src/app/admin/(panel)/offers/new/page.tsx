import { BackLink } from "../../../_components/BackLink";
import { OfferForm } from "../../../_components/OfferForm";

export default function NewOfferPage() {
  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/offers">Deals</BackLink>
      <h1 className="mt-4 mb-10 text-2xl font-semibold text-balance">New offer</h1>
      <OfferForm />
    </div>
  );
}
