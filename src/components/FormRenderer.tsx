"use client";
// OWNER: Faith. Renders any form defined in src/lib/forms.ts and submits it to POST /api/enquiries
// (contract: src/types/contracts.ts). One component for Marketing, Consultation, Partnership and Reservation.
// Forms with more than one section are shown one section per step, with a progress bar. Contact details
// come last so people start with the interesting part (their trip or business).
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, forms, validate, type Field, type FormKind } from "@/lib/forms";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";
import { Icon } from "./Icon";

export type FormValues = Record<string, string | string[]>;

type Props = {
  kind: FormKind;
  /** reservation only */
  tripSlug?: string;
  submitLabel?: string;
  /** small print under the button */
  footnote?: ReactNode;
  initialValues?: FormValues;
  /** tweak a field for this page, e.g. { spots: { max: 4 } } */
  fieldOverrides?: Record<string, Partial<Field>>;
  /** shown just above the submit button; gets the live values (e.g. a price summary) */
  renderSummary?: (values: FormValues) => ReactNode;
  /** hide section titles when there's only one section */
  compact?: boolean;
};

const inputCls = (bad: boolean, empty = false) =>
  `mt-1.5 block min-h-12 w-full rounded-xl border bg-white px-3.5 text-base text-stone-900 placeholder:text-stone-500 outline-none transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-1 ${
    empty ? "text-stone-500" : ""} ${
    bad ? "border-rose-500 focus-visible:ring-rose-600" : "border-stone-300 hover:border-stone-500 focus-visible:border-brand-800 focus-visible:ring-brand-800"
  }`;

/** Short option lists show as tappable chips instead of a dropdown. */
const asChips = (f: Field) => f.type === "select" && (f.options?.length ?? 0) <= 6;

const chipCls = (on: boolean, bad: boolean) =>
  `inline-flex min-h-11 select-none items-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-800 has-[:focus-visible]:ring-offset-2 ${
    on ? "border-brand-800 bg-brand-800 text-white" : bad ? "border-rose-400 bg-white text-stone-800" : "border-stone-300 bg-white text-stone-800 hover:border-brand-600"}`;

const AUTOCOMPLETE: Record<string, string> = {
  name: "name", email: "email", phone: "tel", country: "country-name",
  company: "organization", businessName: "organization", role: "organization-title",
};

export function FormRenderer({ kind, tripSlug, submitLabel = "Send", footnote, initialValues = {}, fieldOverrides = {}, renderSummary, compact }: Props) {
  const router = useRouter();
  const uid = useId();
  const def = forms[kind];
  const all = def.sections.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f, ...fieldOverrides[f.name] })) }));
  const stepped = !compact && all.length > 1;
  const isContact = (t: string) => t === "Your details";
  const sections = stepped ? [...all.filter((s) => !isContact(s.title)), ...all.filter((s) => isContact(s.title))] : all;
  const fields = sections.flatMap((s) => s.fields);
  const [step, setStep] = useState(0);
  const last = !stepped || step === sections.length - 1;
  const topRef = useRef<HTMLDivElement>(null);
  /** which step a field lives on */
  const stepOf = (name: string) => Math.max(0, sections.findIndex((s) => s.fields.some((f) => f.name === name)));

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [sending, setSending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fid = (name: string) => `${uid}-${name}`;

  // warn before leaving a half-filled form
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function clearError(name: string) {
    if (!errors[name]) return;
    const next = { ...errors };
    delete next[name];
    setErrors(next);
    if (Object.keys(next).length === 0) setMessage(undefined);
  }
  const set = (name: string, v: string | string[]) => {
    setValues((s) => ({ ...s, [name]: v }));
    setDirty(true);
    clearError(name);
  };
  const toggle = (name: string, option: string) => {
    const cur = (values[name] as string[] | undefined) ?? [];
    set(name, cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option]);
  };

  function showErrors(errs: Record<string, string>, fallback?: string) {
    setErrors(errs);
    const n = Object.keys(errs).length;
    setMessage(n ? `Please fix ${n} field${n === 1 ? "" : "s"} to continue.` : fallback);
    const first = fields.find((f) => errs[f.name]);
    if (!first) return;
    if (stepped) setStep(stepOf(first.name));
    const chip = first.type === "multi" || asChips(first);
    // wait for the step to render before moving focus
    setTimeout(() => document.getElementById(chip ? `${fid(first.name)}-0` : fid(first.name))?.focus(), 0);
  }

  function collect() {
    const payload: EnquiryRequest["values"] = {};
    for (const f of fields) {
      const v = values[f.name];
      if (v === undefined || v === "") continue;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    }
    // same rules as the server, checked here first so people don't wait for a round trip
    const local = validate(kind, payload);
    for (const f of fields) {
      const n = payload[f.name];
      if (f.type === "number" && typeof n === "number" && f.max != null && n > f.max) local.errors[f.name] = `Enter a number up to ${f.max}`;
    }
    return { payload, errors: local.errors };
  }

  function goTo(i: number) {
    setStep(i);
    setMessage(undefined);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    const { errors: errs } = collect();
    const here = new Set(sections[step].fields.map((f) => f.name));
    const stepErrors = Object.fromEntries(Object.entries(errs).filter(([k]) => here.has(k)));
    if (Object.keys(stepErrors).length) return showErrors(stepErrors);
    setErrors({});
    goTo(step + 1);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!last) return next(); // Enter on an earlier step moves on instead of sending
    const { payload, errors: localErrors } = collect();
    if (Object.keys(localErrors).length) return showErrors(localErrors);

    setSending(true);
    setMessage(undefined);
    const body: EnquiryRequest = {
      kind, tripSlug, values: payload,
      website_url: String(new FormData(e.currentTarget).get("website_url") ?? ""),
    };
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as EnquiryResponse;
      if (data.ok) {
        setDirty(false);
        router.push(data.redirectTo);
        return; // keep the button disabled while the next page loads
      }
      showErrors(data.errors ?? {}, res.status === 429 ? "Too many attempts. Please wait a minute and try again." : data.message ?? "Please check the form.");
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
    setSending(false);
  }

  function control(f: Field) {
    const id = fid(f.name);
    const bad = !!errors[f.name];
    const describedBy = [bad && `${id}-err`, f.help && `${id}-help`].filter(Boolean).join(" ") || undefined;
    const common = { id, name: f.name, required: f.required, "aria-invalid": bad || undefined, "aria-describedby": describedBy, autoComplete: AUTOCOMPLETE[f.name] };
    const v = (values[f.name] as string | undefined) ?? "";

    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={4} value={v} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls(bad)} py-3`} />;
      case "select":
        if (asChips(f)) {
          return (
            <div className="mt-2 flex flex-wrap gap-2">
              {f.options!.map((o, i) => (
                <label key={o} className={chipCls(v === o, bad)}>
                  <input id={`${id}-${i}`} type="radio" name={f.name} className="sr-only" checked={v === o} onChange={() => set(f.name, o)} aria-describedby={describedBy} />
                  {o}
                </label>
              ))}
            </div>
          );
        }
        return (
          <div className="relative">
            <select {...common} value={v} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls(bad, !v)} appearance-none pr-10`}>
              <option value="" disabled>Choose…</option>
              {f.options!.map((o) => <option key={o} className="text-stone-900">{o}</option>)}
            </select>
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 mt-[3px] h-4 w-4 -translate-y-1/2 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        );
      case "country":
        return (
          <div className="relative">
            <select {...common} value={v} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls(bad, !v)} appearance-none pr-10`}>
              <option value="" disabled>Choose…</option>
              {COUNTRIES.map((o) => <option key={o} className="text-stone-900">{o}</option>)}
            </select>
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 mt-[3px] h-4 w-4 -translate-y-1/2 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        );
      case "number": {
        const n = v === "" ? NaN : Number(v);
        const min = f.min ?? 0;
        const bump = (d: number) => {
          const base = Number.isFinite(n) ? n : min;
          const nextN = Math.min(f.max ?? Infinity, Math.max(min, base + d));
          set(f.name, String(nextN));
        };
        const stepBtn = "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl text-ink ring-1 ring-stone-300 transition-[background-color,scale] hover:bg-sand-100 active:scale-[0.94] disabled:opacity-40";
        return (
          <div className="mt-1.5 flex items-center gap-2">
            <button type="button" onClick={() => bump(-1)} disabled={Number.isFinite(n) && n <= min} aria-label={`Fewer: ${f.label}`} className={stepBtn}>−</button>
            <input {...common} type="number" inputMode="numeric" min={f.min} max={f.max} value={v} onChange={(e) => set(f.name, e.target.value)}
              className={`${inputCls(bad).replace("mt-1.5 block", "").replace("w-full", "")} w-20 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} />
            <button type="button" onClick={() => bump(1)} disabled={f.max != null && Number.isFinite(n) && n >= f.max} aria-label={`More: ${f.label}`} className={stepBtn}>+</button>
          </div>
        );
      }
      case "multi": {
        const chosen = (values[f.name] as string[] | undefined) ?? [];
        return (
          <div className="mt-2 flex flex-wrap gap-2">
            {f.options!.map((o, i) => {
              const on = chosen.includes(o);
              return (
                <label key={o} className={chipCls(on, bad)}>
                  <input id={`${id}-${i}`} type="checkbox" className="sr-only" checked={on} onChange={() => toggle(f.name, o)} aria-describedby={describedBy} />
                  {/* fixed-width slot: the tick fades in without the chip changing size */}
                  <span aria-hidden className={`-ml-1 mr-1.5 inline-flex w-4 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${on ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]"}`}>
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  {o}
                </label>
              );
            })}
          </div>
        );
      }
      default: {
        const type = f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text";
        const noSpell = type === "email" || type === "url" || f.name === "website";
        return (
          <input {...common} type={type} value={v} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} className={inputCls(bad)}
            {...(noSpell ? { spellCheck: false, autoCapitalize: "none" } : {})} />
        );
      }
    }
  }

  const shown = stepped ? [sections[step]] : sections;

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <div ref={topRef} className="scroll-mt-28" />
      {/* honeypot: invisible to people, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty <input name="website_url" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {stepped && (
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow text-clay-700" aria-live="polite">Step {step + 1} of {sections.length}</p>
            {step < sections.length - 1 && <p className="text-sm text-stone-500">Next: {sections[step + 1].title}</p>}
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {sections.map((s, i) => (
              <span key={s.title} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand-800" : "bg-stone-200"}`} />
            ))}
          </div>
        </div>
      )}

      {message && <p role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{message}</p>}

      {shown.map((s) => (
        <fieldset key={s.title}>
          <legend className={compact && sections.length === 1 ? "sr-only" : "mb-6 font-display text-3xl text-ink"}>{s.title}</legend>
          <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
            {s.fields.map((f) => {
              const multi = f.type === "multi";
              const grouped = multi || asChips(f);
              const Label = grouped ? "p" : "label";
              return (
                <div key={f.name} className={f.half && !grouped ? "" : "sm:col-span-2"} role={grouped ? "group" : undefined} aria-labelledby={grouped ? `${fid(f.name)}-label` : undefined}>
                  <Label id={`${fid(f.name)}-label`} {...(grouped ? {} : { htmlFor: fid(f.name) })} className="text-sm font-medium text-stone-800">
                    {f.label}
                    {f.required ? <><span className="text-rose-600" aria-hidden> *</span>{grouped && <span className="sr-only"> (required)</span>}</>
                      : <span className="font-normal text-stone-600"> (optional)</span>}
                    {multi && <span className="block text-sm font-normal text-stone-600">Choose all that apply</span>}
                  </Label>
                  {control(f)}
                  {errors[f.name] && <p id={`${fid(f.name)}-err`} className="mt-1.5 text-sm font-medium text-rose-700">{errors[f.name]}</p>}
                  {f.help && <p id={`${fid(f.name)}-help`} className="mt-1.5 text-sm text-stone-600">{f.help}</p>}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      {last && renderSummary?.(values)}

      <div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {stepped && step > 0 && (
            <button type="button" onClick={() => goTo(step - 1)}
              className="min-h-12 rounded-md px-6 font-semibold text-ink ring-2 ring-brand-900 hover:bg-sand-100">
              Back
            </button>
          )}
          <button disabled={sending} className="btn-kanga min-h-12 w-full bg-clay-600 px-7 font-semibold text-white hover:bg-clay-700 disabled:opacity-60 sm:w-auto sm:min-w-56">
            {sending ? "Sending…" : last ? submitLabel : `Continue to ${sections[step + 1].title.toLowerCase()}`}
          </button>
        </div>
        {last && footnote && <p className="mt-3 text-sm text-stone-600">{footnote}</p>}
      </div>
    </form>
  );
}
