import Link from "next/link";
import { TripForm } from "../../../_components/TripForm";

export default function NewTripPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/trips" className="text-sm text-stone-500 hover:underline">← Trips</Link>
      <h1 className="text-2xl font-bold">New trip</h1>
      <TripForm />
    </div>
  );
}
