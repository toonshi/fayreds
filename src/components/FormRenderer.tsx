"use client";
// OWNER: Faith. Renders any form defined in src/lib/forms.ts and submits it to POST /api/enquiries
// (contract: src/types/contracts.ts). One component for Marketing, Consultation, Partnership and Reservation.
import { useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, forms, type Field, type FormKind } from "@/lib/forms";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";

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

const inputCls = (bad: boolean) =>
  `mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 ${
    bad ? "border-rose-500 focus:ring-rose-500/20" : "border-stone-300 focus:border-brand-700 focus:ring-brand-700/20"
  }`;

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
  const fid = (name: string) => `${uid}-${name}`;

  function clearError(name: string) {
    if (!errors[name]) return;
    const next = { ...errors };
    delete next[name];
    setErrors(next);
    if (Object.keys(next).length === 0) setMessage(undefined);
  }
  const set = (name: string, v: string | string[]) => {
    setValues((s) => ({ ...s, [name]: v }));
    clearError(name);
  };
  const toggle = (name: string, option: string) => {
    const cur = (values[name] as string[] | undefined) ?? [];
    set(name, cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option]);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setMessage(undefined);
    const payload: EnquiryRequest["values"] = {};
    for (const f of fields) {
      const v = values[f.name];
      if (v === undefined || v === "") continue;
      payload[f.name] = f.type === "number" ? Number(v) : v;
    }
    const body: EnquiryRequest = {
      kind,
      tripSlug,
      values: payload,
      website_url: String(new FormData(e.currentTarget).get("website_url") ?? ""),
    };
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as EnquiryResponse;
      if (data.ok) {
        router.push(data.redirectTo);
        return; // keep the button disabled while the next page loads
      }
      setErrors(data.errors ?? {});
      setMessage(res.status === 429 ? "Too many attempts. Please wait a minute and try again." : data.message ?? "Please check the form.");
      const first = fields.find((f) => data.errors?.[f.name]);
      if (first) document.getElementById(first.type === "multi" ? `${fid(first.name)}-0` : fid(first.name))?.focus();
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
    setSending(false);
  }

  function control(f: Field) {
    const id = fid(f.name);
    const bad = !!errors[f.name];
    const describedBy = bad ? `${id}-err` : f.help ? `${id}-help` : undefined;
    const common = { id, name: f.name, required: f.required, "aria-invalid": bad || undefined, "aria-describedby": describedBy, className: inputCls(bad) };
    const v = (values[f.name] as string | undefined) ?? "";

    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={4} value={v} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />;
      case "select":
      case "country":
        return (
          <select {...common} value={v} onChange={(e) => set(f.name, e.target.value)}>
            <option value="" disabled>Choose…</option>
            {(f.type === "country" ? COUNTRIES : f.options!).map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      case "number":
        return <input {...common} type="number" inputMode="numeric" min={f.min} max={f.max} value={v} onChange={(e) => set(f.name, e.target.value)} />;
      case "multi": {
        const chosen = (values[f.name] as string[] | undefined) ?? [];
        return (
          <div className="mt-2 flex flex-wrap gap-2">
            {f.options!.map((o, i) => {
              const on = chosen.includes(o);
              return (
                <label key={o} className={`cursor-pointer select-none rounded-full border px-3.5 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun-400 ${
                  on ? "border-brand-800 bg-brand-800 text-white" : bad ? "border-rose-400 bg-white text-stone-700" : "border-stone-300 bg-white text-stone-700 hover:border-brand-600"}`}>
                  <input id={`${id}-${i}`} type="checkbox" className="sr-only" checked={on} onChange={() => toggle(f.name, o)} aria-describedby={describedBy} />
                  {on && <span aria-hidden>✓ </span>}{o}
                </label>
              );
            })}
          </div>
        );
      }
      default: {
        const type = f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text";
        const auto = { name: "name", email: "email", phone: "tel", company: "organization", businessName: "organization", role: "organization-title" }[f.name];
        return <input {...common} type={type} value={v} placeholder={f.placeholder} autoComplete={auto} onChange={(e) => set(f.name, e.target.value)} />;
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
        <fieldset key={s.title} className="space-y-0">
          <legend className={compact && sections.length === 1 ? "sr-only" : "mb-4 font-display text-xl font-semibold text-stone-900"}>{s.title}</legend>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {s.fields.map((f) => {
              const Label = f.type === "multi" ? "p" : "label";
              return (
                <div key={f.name} className={f.half ? "" : "sm:col-span-2"} role={f.type === "multi" ? "group" : undefined} aria-labelledby={f.type === "multi" ? `${fid(f.name)}-label` : undefined}>
                  <Label id={`${fid(f.name)}-label`} {...(f.type === "multi" ? {} : { htmlFor: fid(f.name) })} className="text-sm font-medium text-stone-800">
                    {f.label}
                    {f.required ? <span className="text-rose-600" aria-hidden> *</span> : <span className="font-normal text-stone-500"> (optional)</span>}
                    {f.type === "multi" && <span className="font-normal text-stone-500">. Choose all that apply</span>}
                  </Label>
                  {control(f)}
                  {errors[f.name] ? (
                    <p id={`${fid(f.name)}-err`} className="mt-1.5 text-sm text-rose-700">{errors[f.name]}</p>
                  ) : f.help ? (
                    <p id={`${fid(f.name)}-help`} className="mt-1.5 text-xs text-stone-500">{f.help}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      {renderSummary?.(values)}

      <div>
        <button disabled={sending} className="w-full rounded-full bg-brand-800 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-brand-900 disabled:opacity-60 sm:w-auto">
          {sending ? "Sending…" : submitLabel}
        </button>
        {footnote && <p className="mt-3 text-xs text-stone-500">{footnote}</p>}
      </div>
    </form>
  );
}
