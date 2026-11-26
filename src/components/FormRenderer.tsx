"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, forms, validate, type Field, type FormKind } from "@/lib/forms";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";

type Props = {
  kind: FormKind;
  /** reservation only: which trip this booking is for */
  tripSlug?: string;
  submitLabel?: string;
};

const inputBase =
  "block w-full rounded-xl border bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/60 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/30";

const defaultLabels: Record<FormKind, string> = {
  marketing: "Send enquiry",
  consultation: "Continue to payment",
  partnership: "Send partnership request",
  reservation: "Continue to payment",
};

/** Renders any form defined in src/lib/forms.ts and submits it to POST /api/enquiries. */
export default function FormRenderer({ kind, tripSlug, submitLabel }: Props) {
  const form = forms[kind];
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const id = (name: string) => `${kind}-${name}`;

  function readValues(el: HTMLFormElement) {
    const data = new FormData(el);
    const values: EnquiryRequest["values"] = {};
    for (const section of form.sections) {
      for (const f of section.fields) {
        if (f.type === "multi") values[f.name] = data.getAll(f.name).map(String);
        else values[f.name] = String(data.get(f.name) ?? "").trim();
      }
    }
    return { values, honeypot: String(data.get("website_url") ?? "") };
  }

  function showErrors(errs: Record<string, string>, msg: string) {
    setErrors(errs);
    setMessage(msg);
    // Move focus to the first field with a problem so keyboard and screen reader users find it.
    const first = Object.keys(errs)[0];
    requestAnimationFrame(() => {
      const target = first
        ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
        : formRef.current?.querySelector<HTMLElement>("[data-form-message]");
      target?.focus();
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const { values, honeypot } = readValues(e.currentTarget);

    // Same rules as the server (shared validate()), so most mistakes show instantly.
    const check = validate(kind, values);
    if (!check.ok) return showErrors(check.errors, "Please check the highlighted fields");

    setLoading(true);
    setMessage("");
    try {
      const body: EnquiryRequest = { kind, values, website_url: honeypot, ...(tripSlug ? { tripSlug } : {}) };
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as EnquiryResponse | null;

      if (res.status === 201 && json?.ok) {
        router.push(json.redirectTo);
        return; // keep the loading state while the next page opens
      }
      if (res.status === 429) {
        showErrors({}, "Too many attempts. Please wait a minute and try again.");
      } else if (json && !json.ok) {
        showErrors(json.errors ?? {}, json.message ?? "Please check the highlighted fields");
      } else {
        showErrors({}, "Something went wrong. Please try again.");
      }
    } catch {
      showErrors({}, "We couldn't reach the server. Check your connection and try again.");
    }
    setLoading(false);
  }

  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative space-y-10">
      {message && (
        <div
          data-form-message
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 font-semibold text-brand-700"
        >
          {message}
        </div>
      )}

      {/* Honeypot: hidden from people, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website_url")}>Leave this empty</label>
        <input id={id("website_url")} name="website_url" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {form.sections.map((section) => (
        <fieldset key={section.title} className="space-y-5">
          <legend className="mb-5 font-display text-2xl font-semibold text-ocean-900">{section.title}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.name} className={f.half ? "sm:col-span-1" : "sm:col-span-2"}>
                <FieldInput field={f} id={id(f.name)} error={errors[f.name]} onChange={() => clearError(f.name)} />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="border-t border-sand-dark pt-6">
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-600 px-8 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-wait disabled:opacity-80 sm:w-auto"
        >
          {loading && (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {loading ? "Sending…" : (submitLabel ?? defaultLabels[kind])}
        </button>
        <p className="mt-3 text-sm text-ink-muted">Fields marked * are required.</p>
      </div>
    </form>
  );
}

function FieldInput({ field: f, id, error, onChange }: { field: Field; id: string; error?: string; onChange: () => void }) {
  const helpId = f.help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const border = error ? "border-brand-600" : "border-sand-dark";
  const common = {
    id,
    name: f.name,
    onChange,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": f.required || undefined,
  } as const;

  const label = (
    <>
      {f.label}
      {f.required && <span className="text-brand-600" aria-hidden> *</span>}
    </>
  );

  const helpAndError = (
    <>
      {f.help && <p id={helpId} className="mt-1.5 text-sm text-ink-muted">{f.help}</p>}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </>
  );

  if (f.type === "multi") {
    return (
      <fieldset aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
        <legend className="mb-2 font-semibold text-ink">{label}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {f.options!.map((opt, i) => (
            <label
              key={opt}
              htmlFor={`${id}-${i}`}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 has-[:checked]:border-ocean-600 has-[:checked]:bg-ocean-50 ${border}`}
            >
              <input id={`${id}-${i}`} type="checkbox" name={f.name} value={opt} onChange={onChange} className="h-5 w-5 shrink-0 accent-ocean-600" />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {helpAndError}
      </fieldset>
    );
  }

  let control: React.ReactNode;
  if (f.type === "textarea") {
    control = <textarea {...common} rows={5} placeholder={f.placeholder} className={`${inputBase} ${border}`} />;
  } else if (f.type === "select" || f.type === "country") {
    const options = f.type === "country" ? COUNTRIES : f.options!;
    control = (
      <select {...common} defaultValue="" className={`${inputBase} ${border} appearance-none bg-[length:1.25rem] bg-[right_0.9rem_center] bg-no-repeat pr-10`} style={{ backgroundImage: chevron }}>
        <option value="" disabled>
          {f.type === "country" ? "Choose a country" : "Choose an option"}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else {
    const auto: Partial<Record<string, string>> = { name: "name", email: "email", phone: "tel" };
    control = (
      <input
        {...common}
        type={f.type}
        min={f.min}
        max={f.max}
        inputMode={f.type === "number" ? "numeric" : undefined}
        autoComplete={auto[f.name]}
        placeholder={f.placeholder}
        className={`${inputBase} ${border}`}
      />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-ink">{label}</label>
      {control}
      {helpAndError}
    </div>
  );
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235F574F' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";
