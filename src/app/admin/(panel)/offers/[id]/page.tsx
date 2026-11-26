import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BackLink } from "../../../_components/BackLink";
import { OfferForm } from "../../../_components/OfferForm";
import { SubmitButton } from "../../../_components/SubmitButton";
import { deleteOffer } from "../../../_lib/actions";
import { btn } from "../../../_lib/ui";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await db.offer.findUnique({ where: { id } });
  if (!offer) notFound();
  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/offers">Deals</BackLink>
      <h1 className="mt-4 mb-10 text-2xl font-semibold text-balance">{offer.title}</h1>
      <OfferForm offer={offer} />
      <form action={deleteOffer.bind(null, offer.id)} className="mt-12 border-t border-stone-200 pt-8">
        <SubmitButton pendingLabel="Deleting…" confirm="Delete this offer? If it was ever booked it is only switched off, so your commission history stays." className={btn.danger}>
          Delete offer
        </SubmitButton>
      </form>
    </div>
  );
}
