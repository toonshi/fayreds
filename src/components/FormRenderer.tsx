"use client";
// OWNER: Faith. Renders any form defined in src/lib/forms.ts and submits it to POST /api/enquiries
// (contract: src/types/contracts.ts). One component for Marketing, Consultation, Partnership and Reservation.
import { useEffect, useId, useState, type ReactNode } from "react";
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
    bad ? "border-rose-500 focus-visible:ring-rose-600" : "border-stone-300 hover:border-stone-400 focus-visible:border-brand-800 focus-visible:ring-brand-800"
  }`;

const AUTOCOMPLETE: Record<string, string> = {
  name: "name", email: "email", phone: "tel", country: "country-name",
  company: "organization", businessName: "organization", role: "organization-title",
};

export function FormRenderer({ kind, tripSlug, submitLabel = "Send", footnote, initialValues = {}, fieldOverrides = {}, renderSummary, compact }: Props) {
  const router = useRouter();
  const uid = useId();
  const def = forms[kind];
  const sections = def.sections.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f, ...fieldOverrides[f.name] })) }));
  const fields = sections.flatMap((s) => s.fields);

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
    if (first) document.getElementById(first.type === "multi" ? `${fid(first.name)}-0` : fid(first.name))?.focus();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    if (Object.keys(local.errors).length) return showErrors(local.errors);

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
      case "country":
        return (
          <div className="relative">
            <select {...common} value={v} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls(bad, !v)} appearance-none pr-10`}>
              <option value="" disabled>Choose…</option>
              {(f.type === "country" ? COUNTRIES : f.options!).map((o) => <option key={o} className="text-stone-900">{o}</option>)}
            </select>
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 mt-[3px] h-4 w-4 -translate-y-1/2 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        );
      case "number":
        return <input {...common} type="number" inputMode="numeric" min={f.min} max={f.max} value={v} onChange={(e) => set(f.name, e.target.value)} className={`${inputCls(bad)} tabular-nums`} />;
      case "multi": {
        const chosen = (values[f.name] as string[] | undefined) ?? [];
        return (
          <div className="mt-2 flex flex-wrap gap-2">
            {f.options!.map((o, i) => {
              const on = chosen.includes(o);
              return (
                <label key={o} className={`inline-flex min-h-11 select-none items-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-800 has-[:focus-visible]:ring-offset-2 ${
                  on ? "border-brand-800 bg-brand-800 text-white" : bad ? "border-rose-400 bg-white text-stone-800" : "border-stone-300 bg-white text-stone-800 hover:border-brand-600"}`}>
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

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      {/* honeypot: invisible to people, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty <input name="website_url" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {message && <p role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{message}</p>}

      {sections.map((s) => (
        <fieldset key={s.title}>
          <legend className={compact && sections.length === 1 ? "sr-only" : "mb-4 font-display text-xl font-semibold text-stone-900"}>{s.title}</legend>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {s.fields.map((f) => {
              const multi = f.type === "multi";
              const Label = multi ? "p" : "label";
              return (
                <div key={f.name} className={f.half ? "" : "sm:col-span-2"} role={multi ? "group" : undefined} aria-labelledby={multi ? `${fid(f.name)}-label` : undefined}>
                  <Label id={`${fid(f.name)}-label`} {...(multi ? {} : { htmlFor: fid(f.name) })} className="text-sm font-medium text-stone-800">
                    {f.label}
                    {f.required ? <><span className="text-rose-600" aria-hidden> *</span>{multi && <span className="sr-only"> (required)</span>}</>
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

      {renderSummary?.(values)}

      <div>
        <button disabled={sending} className="min-h-12 w-full rounded-full bg-brand-800 px-7 font-semibold text-white shadow-sm transition-[background-color,scale] hover:bg-brand-900 active:not-disabled:scale-[0.96] disabled:opacity-60 sm:w-auto sm:min-w-56">
          {sending ? "Sending…" : submitLabel}
        </button>
        {footnote && <p className="mt-3 text-sm text-stone-600">{footnote}</p>}
      </div>
    </form>
  );
}
