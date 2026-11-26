"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Trip } from "@prisma/client";
import { saveTrip, type TripFormState } from "../_lib/actions";
import { btn, h2, input as uiInput, textarea as uiTextarea } from "../_lib/ui";

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

  const fieldCls = (name: string, multiline = false) =>
    `mt-1.5 ${multiline ? uiTextarea : uiInput} ${err(name) ? "border-rose-500 hover:border-rose-500" : ""}`;

  const describe = (name: string, help?: string) => (err(name) ? `${name}-err` : help ? `${name}-help` : undefined);
  const note = (name: string, help?: string) =>
    err(name) ? (
      <span id={`${name}-err`} className="mt-1.5 block text-[13px] text-rose-700">{err(name)}</span>
    ) : help ? (
      <span id={`${name}-help`} className="mt-1.5 block text-[13px] text-stone-500">{help}</span>
    ) : null;

  type InputOpts = { type?: string; value?: string | number; help?: string; half?: boolean; placeholder?: string; required?: boolean; money?: boolean };
  const input = (name: string, label: string, o: InputOpts = {}) => (
    <label className={`block text-sm ${o.half ? "" : "sm:col-span-2"}`}>
      <span className="font-medium text-stone-800">{label}{o.required && <span aria-hidden className="text-rose-600"> *</span>}</span>
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
      <span className="font-medium text-stone-800">{label}{required && <span aria-hidden className="text-rose-600"> *</span>}</span>
      <textarea name={name} defaultValue={val(name, value)} rows={4} required={required}
        aria-invalid={err(name) ? true : undefined} aria-describedby={describe(name, help)} className={fieldCls(name, true)} />
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
      className="space-y-12"
    >
      {state?.message && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.message}</p>}

      <fieldset className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <legend className={`mb-5 ${h2}`}>The trip</legend>
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

      <fieldset className="grid gap-x-5 gap-y-6 border-t border-stone-200 pt-10 sm:grid-cols-2">
        <legend className={`mb-5 ${h2}`}>Prices per person and spots</legend>
        {input("priceKes", "Full price (KES): Kenyans", { type: "number", value: trip?.priceKes, half: true, required: true, money: true })}
        {input("priceUsd", "Full price (USD): international", { type: "number", value: trip?.priceUsd, half: true, required: true, money: true })}
        {input("depositKes", "Deposit (KES)", { type: "number", value: trip?.depositKes, half: true, required: true, money: true })}
        {input("depositUsd", "Deposit (USD)", { type: "number", value: trip?.depositUsd, half: true, required: true, money: true })}
        {input("totalSpots", "Total spots", { type: "number", value: trip?.totalSpots ?? 12, half: true, required: true, money: true })}
        <label className="flex h-10 items-center gap-2.5 self-end text-sm">
          <input type="checkbox" name="published" defaultChecked={state?.values ? state.values.published === "on" : trip?.published ?? true} className="size-4 accent-brand-800" />
          <span className="font-medium text-stone-800">Show on the website</span>
        </label>
      </fieldset>

      <div className="border-t border-stone-200 pt-8">
        <button disabled={pending} className={`${btn.primary} sm:min-w-40`}>
          {pending ? "Saving…" : trip ? "Save changes" : "Create trip"}
        </button>
      </div>
    </form>
  );
}
