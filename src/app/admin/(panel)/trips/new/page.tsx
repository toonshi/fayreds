import { BackLink } from "../../../_components/BackLink";
import { TripForm } from "../../../_components/TripForm";

export default function NewTripPage() {
  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/trips">Trips</BackLink>
      <h1 className="mt-4 mb-10 text-2xl font-semibold">New trip</h1>
      <TripForm />
    </div>
  );
}
