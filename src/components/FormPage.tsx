// OWNER: Faith. Shared layout for the Marketing / Consultation / Partnership pages:
// intro + "what happens next" on the left, the form on the right.
import type { ReactNode } from "react";
import { forms, type FormKind } from "@/lib/forms";
import { FormRenderer, type FormValues } from "./FormRenderer";

export function FormPage({ kind, eyebrow, title, children, steps, submitLabel, footnote, initialValues }: {
  kind: FormKind;
  eyebrow: string;
  title: string;
  /** extra content under the intro (offer, pricing…) */
  children?: ReactNode;
  steps: string[];
  submitLabel: string;
  footnote?: ReactNode;
  initialValues?: FormValues;
}) {
  return (
    <main className="bg-sand-50 text-stone-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow text-clay-700">{eyebrow}</p>
            <h1 className="mt-3 text-4xl leading-[1.05] text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-700">{forms[kind].intro}</p>
            {children}
            <div className="mt-10 border-t border-stone-900/15 pt-6">
              <h2 className="eyebrow font-sans text-stone-500">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span aria-hidden className="w-6 shrink-0 font-display text-2xl leading-none text-clay-600">{i + 1}</span>
                    <span className="text-stone-700">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <section aria-label="Form" className="-mx-5 bg-white px-5 py-8 ring-1 ring-stone-900/10 sm:mx-0 sm:rounded-2xl sm:p-10 lg:col-span-3">
          <FormRenderer kind={kind} submitLabel={submitLabel} footnote={footnote} initialValues={initialValues} />
        </section>
      </div>
    </main>
  );
}
