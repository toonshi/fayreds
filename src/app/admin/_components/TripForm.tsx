"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Trip } from "@prisma/client";
import { saveTrip, type TripFormState } from "../_lib/actions";

const day = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function TripForm({ trip }: { trip?: Trip }) {
  const [state, action, pending] = useActionState<TripFormState, FormData>(saveTrip.bind(null, trip?.id ?? null), undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const err = (k: string) => state?.errors?.[k];
  // after a failed save, show what was typed (React resets uncontrolled forms after an action)
  const val = (k: string, fallback: string | number | undefined) => state?.values?.[k] ?? fallback ?? "";

  // focus the first problem after a failed save
  useEffect(() => {
    if (state?.errors) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const fieldCls = (name: string) =>
    `mt-1 w-full rounded-md border bg-white px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 sm:text-sm ${err(name) ? "border-rose-500" : "border-stone-300 focus-visible:border-teal-700"}`;

  const describe = (name: string, help?: string) => (err(name) ? `${name}-err` : help ? `${name}-help` : undefined);
  const note = (name: string, help?: string) =>
    err(name) ? (
      <span id={`${name}-err`} className="mt-1 block text-xs text-rose-700">{err(name)}</span>
    ) : help ? (
      <span id={`${name}-help`} className="mt-1 block text-xs text-stone-600">{help}</span>
    ) : null;

  type InputOpts = { type?: string; value?: string | number; help?: string; half?: boolean; placeholder?: string; required?: boolean; money?: boolean };
  const input = (name: string, label: string, o: InputOpts = {}) => (
    <label className={`block text-sm ${o.half ? "" : "sm:col-span-2"}`}>
      <span className="font-medium">{label}{o.required && <span aria-hidden className="text-rose-600"> *</span>}</span>
      <input
        name={name} type={o.type ?? "text"} defaultValue={val(name, o.value)} placeholder={o.placeholder} required={o.required}
        aria-invalid={err(name) ? true : undefined} aria-describedby={describe(name, o.help)}
        {...(o.money ? { min: 1, step: 1, inputMode: "numeric" as const } : {})}
        {...(o.type === "url" ? { spellCheck: false, autoCapitalize: "none" } : {})}
        className={`${fieldCls(name)} ${o.money ? "tabular-nums" : ""}`}
      />
      {note(name, o.help)}
    </label>
  );
  const area = (name: string, label: string, value: string, help?: string, required?: boolean) => (
    <label className="block text-sm sm:col-span-2">
      <span className="font-medium">{label}{required && <span aria-hidden className="text-rose-600"> *</span>}</span>
      <textarea name={name} defaultValue={val(name, value)} rows={4} required={required}
        aria-invalid={err(name) ? true : undefined} aria-describedby={describe(name, help)} className={fieldCls(name)} />
      {note(name, help)}
    </label>
  );

  return (
    <form
      ref={formRef}
      // remount after each failed save so the returned values become the new defaults
      key={state?.values ? JSON.stringify(state.values) : "initial"}
      action={(fd) => { setDirty(false); action(fd); }}
      onChange={() => setDirty(true)}
      noValidate
      className="space-y-6"
    >
      {state?.message && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{state.message}</p>}

      <fieldset className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 sm:grid-cols-2">
        <legend className="px-1 font-semibold">The trip</legend>
        {input("title", "Title", { value: trip?.title, placeholder: "Diani Beach Escape", required: true })}
        {input("destination", "Destination", { value: trip?.destination, half: true, placeholder: "Diani, Kenya", required: true })}
        {input("slug", "Web address", { value: trip?.slug, half: true, help: "fayreds…/trips/<this>. Leave empty to make it from the title." })}
        {input("startDate", "Start date", { type: "date", value: day(trip?.startDate), half: true, required: true })}
        {input("endDate", "End date", { type: "date", value: day(trip?.endDate), half: true, required: true })}
        {area("summary", "Summary", trip?.summary ?? "", "Two or three sentences shown on the trip card and page.", true)}
        {area("highlights", "Highlights", trip?.highlights.join("\n") ?? "", "One per line.")}
        {area("includes", "What's included", trip?.includes.join("\n") ?? "", "One per line.")}
        {input("imageUrl", "Photo link", { type: "url", value: trip?.imageUrl ?? "", placeholder: "https://…", help: "A link to a landscape photo (e.g. Cloudinary or a Google Photos share link)." })}
      </fieldset>

      <fieldset className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Prices (per person) and spots</legend>
        {input("priceKes", "Full price (KES): Kenyans", { type: "number", value: trip?.priceKes, half: true, required: true, money: true })}
        {input("priceUsd", "Full price (USD): international", { type: "number", value: trip?.priceUsd, half: true, required: true, money: true })}
        {input("depositKes", "Deposit (KES)", { type: "number", value: trip?.depositKes, half: true, required: true, money: true })}
        {input("depositUsd", "Deposit (USD)", { type: "number", value: trip?.depositUsd, half: true, required: true, money: true })}
        {input("totalSpots", "Total spots", { type: "number", value: trip?.totalSpots ?? 12, half: true, required: true, money: true })}
        <label className="flex min-h-11 items-center gap-2 self-end text-sm">
          <input type="checkbox" name="published" defaultChecked={state?.values ? state.values.published === "on" : trip?.published ?? true} className="h-5 w-5 accent-teal-700" />
          <span className="font-medium">Show on the website</span>
        </label>
      </fieldset>

      <button disabled={pending} className="min-h-11 rounded-lg bg-teal-700 px-6 font-semibold text-white transition-[background-color,scale] hover:bg-teal-800 active:not-disabled:scale-[0.96] disabled:opacity-60 sm:min-w-40">
        {pending ? "Saving…" : trip ? "Save changes" : "Create trip"}
      </button>
    </form>
  );
}
