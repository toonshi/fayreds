// OWNER: Faith. Shared layout for the Marketing / Consultation / Partnership pages:
// intro + "what happens next" on the left, the form on the right.
import type { ReactNode } from "react";
import { forms, type FormKind } from "@/lib/forms";
import { FormRenderer, type FormValues } from "./FormRenderer";

export function FormPage({ kind, eyebrow, title, children, steps, submitLabel, footnote, initialValues, after }: {
  kind: FormKind;
  eyebrow: string;
  title: string;
  /** extra content under the intro (offer, pricing…) */
  children?: ReactNode;
  steps: string[];
  submitLabel: string;
  footnote?: ReactNode;
  initialValues?: FormValues;
  /** extra sections below the form (e.g. example content) */
  after?: ReactNode;
}) {
  return (
    <main className="bg-sand-50 text-stone-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-16 lg:grid-cols-5 lg:gap-14">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-700">{forms[kind].intro}</p>
            {children}
            <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
              <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-stone-600">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5 text-stone-800">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <section id="plan" aria-label="Form" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-8 lg:col-span-3">
          <FormRenderer kind={kind} submitLabel={submitLabel} footnote={footnote} initialValues={initialValues} />
        </section>
      </div>
      {after}
    </main>
  );
}
