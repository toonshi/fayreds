import { BackLink } from "../../../_components/BackLink";
import { TripForm } from "../../../_components/TripForm";

export default function NewTripPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <BackLink href="/admin/trips">Trips</BackLink>
      <h1 className="text-2xl font-bold">New trip</h1>
      <TripForm />
    </div>
  );
}
