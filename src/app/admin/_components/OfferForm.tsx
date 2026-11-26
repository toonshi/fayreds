"use client";
// Add or edit a partner offer for the deal finder.
import { useActionState } from "react";
import type { Offer } from "@prisma/client";
import { saveOffer, type OfferFormState } from "../_lib/actions";
import { btn, input as uiInput } from "../_lib/ui";

const CATEGORIES = [
  ["STAY", "Stay (hotel, Airbnb, lodge)"],
  ["ACTIVITY", "Activity (paragliding, safari, tour…)"],
  ["TRANSPORT", "Transfers & transport"],
  ["DINING", "Dining"],
  ["NIGHTLIFE", "Nightlife"],
  ["OTHER", "Other"],
] as const;
const UNITS = [
  ["PER_PERSON", "per person"],
  ["PER_NIGHT", "per night (whole room or house)"],
  ["PER_GROUP", "per group (whole booking)"],
] as const;

export function OfferForm({ offer }: { offer?: Offer }) {
  const [state, action, pending] = useActionState<OfferFormState, FormData>(saveOffer.bind(null, offer?.id ?? null), undefined);
  const err = (k: string) => state?.errors?.[k];
  const val = (k: string, fallback: string | number | null | undefined) => state?.values?.[k] ?? fallback ?? "";
  const cls = (k: string) =>
    `mt-1.5 ${uiInput} ${err(k) ? "border-rose-500 hover:border-rose-500" : ""}`;
  const note = (k: string, help?: string) =>
    err(k) ? <span className="mt-1.5 block text-[13px] text-rose-700">{err(k)}</span> : help ? <span className="mt-1.5 block text-[13px] text-stone-500">{help}</span> : null;

  return (
    <form action={action} className="space-y-8">
      {state?.message && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.message}</p>}
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-stone-800">Offer name <span aria-hidden className="text-rose-600">*</span></span>
          <input name="title" defaultValue={val("title", offer?.title)} placeholder="Tandem paragliding flight" aria-invalid={err("title") ? true : undefined} className={cls("title")} />
          {note("title")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Partner <span aria-hidden className="text-rose-600">*</span></span>
          <input name="partner" defaultValue={val("partner", offer?.partner)} placeholder="Business name" aria-invalid={err("partner") ? true : undefined} className={cls("partner")} />
          {note("partner")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Category <span aria-hidden className="text-rose-600">*</span></span>
          <select name="category" defaultValue={val("category", offer?.category ?? "STAY")} className={cls("category")}>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {note("category")}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-stone-800">Location <span aria-hidden className="text-rose-600">*</span></span>
          <input name="location" defaultValue={val("location", offer?.location)} placeholder="Diani, Kenya" aria-invalid={err("location") ? true : undefined} className={cls("location")} />
          {note("location", "Use the place names clients type, e.g. \"Diani\", \"Nairobi\", \"Zanzibar\". Write \"Anywhere in Kenya\" for offers that work everywhere.")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Price in KES <span aria-hidden className="text-rose-600">*</span></span>
          <input name="priceKes" type="number" min={1} step={1} inputMode="numeric" defaultValue={val("priceKes", offer?.priceKes)} aria-invalid={err("priceKes") ? true : undefined} className={`${cls("priceKes")} tabular-nums`} />
          {note("priceKes")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Charged</span>
          <select name="unit" defaultValue={val("unit", offer?.unit ?? "PER_PERSON")} className={cls("unit")}>
            {UNITS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {note("unit")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Max guests</span>
          <input name="maxGuests" type="number" min={1} step={1} inputMode="numeric" defaultValue={val("maxGuests", offer?.maxGuests)} className={`${cls("maxGuests")} tabular-nums`} />
          {note("maxGuests", "Leave empty if there's no limit.")}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-800">Your commission (%)</span>
          <input name="commissionPct" type="number" min={0} max={100} step={1} inputMode="numeric" defaultValue={val("commissionPct", offer?.commissionPct ?? 0)} className={`${cls("commissionPct")} tabular-nums`} />
          {note("commissionPct")}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-stone-800">Tags</span>
          <input name="tags" defaultValue={val("tags", offer?.tags.join(", "))} placeholder="beach, airbnb, family, adventure, luxury" className={cls("tags")} />
          {note("tags", "Comma-separated. They're matched with what clients say they enjoy and where they like to stay.")}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-stone-800">Booking link</span>
          <input name="bookingUrl" type="url" spellCheck={false} defaultValue={val("bookingUrl", offer?.bookingUrl)} placeholder="https://… (your referral link if you have one)" aria-invalid={err("bookingUrl") ? true : undefined} className={cls("bookingUrl")} />
          {note("bookingUrl")}
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-stone-800">Notes</span>
          <textarea name="notes" rows={3} defaultValue={val("notes", offer?.notes)} placeholder="Promo code, contact person, season, what's included…" className={`${cls("notes")} h-auto py-2.5 leading-relaxed`} />
        </label>
        <label className="inline-flex h-10 items-center gap-2.5 text-sm font-medium text-stone-800 sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={state?.values ? state.values.active === "on" : offer?.active ?? true} className="size-4 accent-brand-800" />
          Active (suggest this offer to clients)
        </label>
      </div>
      <button disabled={pending} className={`${btn.primary} sm:min-w-40`}>
        {pending ? "Saving…" : offer ? "Save changes" : "Add offer"}
      </button>
    </form>
  );
}
