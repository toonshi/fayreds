import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BackLink } from "../../../_components/BackLink";
import { OfferForm } from "../../../_components/OfferForm";
import { SubmitButton } from "../../../_components/SubmitButton";
import { deleteOffer } from "../../../_lib/actions";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await db.offer.findUnique({ where: { id } });
  if (!offer) notFound();
  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/admin/offers">Deals</BackLink>
      <h1 className="text-2xl font-bold">{offer.title}</h1>
      <OfferForm offer={offer} />
      <form action={deleteOffer.bind(null, offer.id)}>
        <SubmitButton pendingLabel="Deleting…" confirm="Delete this offer? If it was ever booked it is only switched off, so your commission history stays." className="text-rose-700 hover:bg-rose-50">
          Delete offer
        </SubmitButton>
      </form>
    </div>
  );
}
