// OWNER: Faith. Tabs at the top of the form card: switch between the three enquiry forms.
import Link from "next/link";
import type { FormKind } from "@/lib/forms";

const tabs: { kind: FormKind; href: string; label: string }[] = [
  { kind: "partnership", href: "/partnership", label: "Partnership" },
  { kind: "consultation", href: "/consultation", label: "Itineraries" },
  { kind: "marketing", href: "/marketing", label: "Marketing" },
];

export function FormTabs({ active }: { active: FormKind }) {
  if (!tabs.some((t) => t.kind === active)) return null;
  return (
    <nav aria-label="Choose a form" className="mb-8">
      <ul className="grid grid-cols-3 gap-1 rounded-2xl bg-sand-100 p-1 ring-1 ring-stone-200">
        {tabs.map((t) => {
          const on = t.kind === active;
          return (
            <li key={t.kind}>
              <Link
                href={t.href}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-sm font-semibold transition-colors sm:text-base ${
                  on ? "bg-brand-800 text-white shadow-sm" : "text-stone-700 hover:bg-white hover:text-brand-900"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
