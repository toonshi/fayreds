import FormRenderer from "./FormRenderer";
import { forms, type FormKind } from "@/lib/forms";

type Props = {
  kind: FormKind;
  eyebrow: string;
  /** "What to expect" steps shown next to the form */
  steps: { title: string; text: string }[];
  aside?: React.ReactNode;
};

/** Shared layout for the Marketing, Consultation and Partnership pages. */
export default function FormPage({ kind, eyebrow, steps, aside }: Props) {
  const form = forms[kind];
  return (
    <main>
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ocean-900 sm:text-5xl">{form.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">{form.intro}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_20rem] lg:py-16">
        <div className="order-2 lg:order-1">
          <FormRenderer kind={kind} />
        </div>

        <aside className="order-1 lg:order-2" aria-labelledby={`${kind}-expect`}>
          <div className="rounded-card bg-ocean-50 p-6 lg:sticky lg:top-28">
            <h2 id={`${kind}-expect`} className="font-display text-xl font-semibold text-ocean-900">What to expect</h2>
            <ol className="mt-5 space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-900 text-sm font-bold text-white" aria-hidden>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {aside}
          </div>
        </aside>
      </div>
    </main>
  );
}
