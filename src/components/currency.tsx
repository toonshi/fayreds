"use client";
// OWNER: Faith. Which currency a visitor sees: KES for Kenya, USD for everyone else.
// Default guess comes from the browser's time zone; the visitor can switch, and the choice is remembered.
import { useSyncExternalStore } from "react";

export type Currency = "KES" | "USD";
const KEY = "ft_currency";
const listeners = new Set<() => void>();

function guess(): Currency {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "KES" || saved === "USD") return saved;
  } catch {}
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return tz === "Africa/Nairobi" ? "KES" : "USD";
}

let current: Currency | null = null;
function get() {
  return (current ??= guess());
}

export function setCurrency(c: Currency) {
  current = c;
  try {
    localStorage.setItem(KEY, c);
  } catch {}
  listeners.forEach((l) => l());
}

export function useCurrency(): Currency | null {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    get,
    () => null, // server render: unknown yet
  );
}

export const formatKes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export const formatUsd = (n: number) => `US$${n.toLocaleString("en-US")}`;

/** Shows KES or USD depending on the visitor; on the server (before we know) it shows both. */
export function Price({ kes, usd, className }: { kes: number; usd: number; className?: string }) {
  const c = useCurrency();
  if (c === "KES") return <span className={className}>{formatKes(kes)}</span>;
  if (c === "USD") return <span className={className}>{formatUsd(usd)}</span>;
  return <span className={className}>{formatKes(kes)} / {formatUsd(usd)}</span>;
}

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const c = useCurrency();
  return (
    <div role="group" aria-label="Show prices in" className={`inline-flex rounded-full bg-white p-1 text-sm ring-1 ring-stone-200 ${className}`}>
      {(["KES", "USD"] as const).map((x) => (
        <button
          key={x}
          type="button"
          onClick={() => setCurrency(x)}
          aria-pressed={c === x}
          className={`rounded-full px-3 py-1 font-medium ${c === x ? "bg-ocean-800 text-white" : "text-stone-600 hover:text-stone-900"}`}
        >
          {x === "KES" ? "KES · Kenya" : "USD · International"}
        </button>
      ))}
    </div>
  );
}
