"use client";
import { useActionState } from "react";
import type { Trip } from "@prisma/client";
import { saveTrip, type TripFormState } from "../_lib/actions";

const day = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function TripForm({ trip }: { trip?: Trip }) {
  const [state, action, pending] = useActionState<TripFormState, FormData>(saveTrip.bind(null, trip?.id ?? null), undefined);
  const err = (k: string) => state?.errors?.[k];

  const input = (name: string, label: string, opts: { type?: string; value?: string | number; help?: string; half?: boolean; placeholder?: string } = {}) => (
    <label className={`block text-sm ${opts.half ? "" : "sm:col-span-2"}`}>
      <span className="font-medium">{label}</span>
      <input
        name={name} type={opts.type ?? "text"} defaultValue={opts.value ?? ""} placeholder={opts.placeholder}
        aria-invalid={!!err(name)}
        className={`mt-1 w-full rounded-md border px-3 py-2 ${err(name) ? "border-rose-500" : "border-stone-300"}`}
      />
      {opts.help && !err(name) && <span className="mt-1 block text-xs text-stone-500">{opts.help}</span>}
      {err(name) && <span className="mt-1 block text-xs text-rose-700">{err(name)}</span>}
    </label>
  );
  const area = (name: string, label: string, value: string, help?: string) => (
    <label className="block text-sm sm:col-span-2">
      <span className="font-medium">{label}</span>
      <textarea name={name} defaultValue={value} rows={4}
        className={`mt-1 w-full rounded-md border px-3 py-2 ${err(name) ? "border-rose-500" : "border-stone-300"}`} />
      {help && !err(name) && <span className="mt-1 block text-xs text-stone-500">{help}</span>}
      {err(name) && <span className="mt-1 block text-xs text-rose-700">{err(name)}</span>}
    </label>
  );

  return (
    <form action={action} className="space-y-6">
      {state?.message && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{state.message}</p>}

      <fieldset className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 sm:grid-cols-2">
        <legend className="px-1 font-semibold">The trip</legend>
        {input("title", "Title", { value: trip?.title, placeholder: "Diani Beach Escape" })}
        {input("destination", "Destination", { value: trip?.destination, half: true, placeholder: "Diani, Kenya" })}
        {input("slug", "Web address", { value: trip?.slug, half: true, help: "fayreds…/trips/<this>. Leave empty to make it from the title." })}
        {input("startDate", "Start date", { type: "date", value: day(trip?.startDate), half: true })}
        {input("endDate", "End date", { type: "date", value: day(trip?.endDate), half: true })}
        {area("summary", "Summary", trip?.summary ?? "", "Two or three sentences shown on the trip card and page.")}
        {area("highlights", "Highlights", trip?.highlights.join("\n") ?? "", "One per line.")}
        {area("includes", "What's included", trip?.includes.join("\n") ?? "", "One per line.")}
        {input("imageUrl", "Photo link", { value: trip?.imageUrl ?? "", placeholder: "https://…", help: "A link to a landscape photo (e.g. from Cloudinary or Google Photos share link)." })}
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Prices (per person) and spots</legend>
        {input("priceKes", "Full price (KES): Kenyans", { type: "number", value: trip?.priceKes, half: true })}
        {input("priceUsd", "Full price (USD): international", { type: "number", value: trip?.priceUsd, half: true })}
        {input("depositKes", "Deposit (KES)", { type: "number", value: trip?.depositKes, half: true })}
        {input("depositUsd", "Deposit (USD)", { type: "number", value: trip?.depositUsd, half: true })}
        {input("totalSpots", "Total spots", { type: "number", value: trip?.totalSpots ?? 12, half: true })}
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={trip?.published ?? true} className="h-4 w-4 accent-teal-700" />
          <span className="font-medium">Show on the website</span>
        </label>
      </fieldset>

      <button disabled={pending} className="rounded-lg bg-teal-700 px-6 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
        {pending ? "Saving…" : trip ? "Save changes" : "Create trip"}
      </button>
    </form>
  );
}
