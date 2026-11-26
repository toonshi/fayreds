"use client";
// OWNER: Faith. Which currency a visitor sees: KES for Kenya, USD for everyone else.
// The choice is kept in a cookie so the server renders the right currency straight away (no flash).
// First visit: guessed from the browser's time zone; the visitor can switch with <CurrencyToggle>.
import { createContext, useContext, useSyncExternalStore } from "react";

export type Currency = "KES" | "USD";
export const CURRENCY_COOKIE = "ft_currency";
const listeners = new Set<() => void>();
let current: Currency | null = null;

const InitialCurrency = createContext<Currency | null>(null);

/** Wrap public pages with the currency read from the cookie on the server. */
export function CurrencyProvider({ initial, children }: { initial: Currency | null; children: React.ReactNode }) {
  return <InitialCurrency.Provider value={initial}>{children}</InitialCurrency.Provider>;
}

function guess(): Currency {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return tz === "Africa/Nairobi" ? "KES" : "USD";
}

function remember(c: Currency) {
  document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function setCurrency(c: Currency) {
  current = c;
  remember(c);
  listeners.forEach((l) => l());
}

export function useCurrency(): Currency | null {
  const initial = useContext(InitialCurrency);
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => {
      if (!current) {
        current = initial ?? guess();
        if (!initial) remember(current);
      }
      return current;
    },
    () => initial, // server render and hydration: whatever the cookie said (null on a first visit)
  );
}

export const formatKes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
export const formatUsd = (n: number) => `US$${n.toLocaleString("en-US")}`;

/** Shows KES or USD for this visitor; before we know (first visit, server render) it shows both. */
export function Price({ kes, usd, className }: { kes: number; usd: number; className?: string }) {
  const c = useCurrency();
  const cls = `tabular-nums ${className ?? ""}`;
  if (c === "KES") return <span className={cls}>{formatKes(kes)}</span>;
  if (c === "USD") return <span className={cls}>{formatUsd(usd)}</span>;
  return <span className={cls}>{formatKes(kes)} / {formatUsd(usd)}</span>;
}

export function CurrencyToggle({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const c = useCurrency();
  return (
    <div role="group" aria-label="Show prices in" className={`inline-flex rounded-full p-0.5 text-sm ${tone === "dark" ? "bg-white/10" : "bg-white ring-1 ring-stone-200"} ${className}`}>
      {(["KES", "USD"] as const).map((x) => (
        <button
          key={x}
          type="button"
          onClick={() => setCurrency(x)}
          aria-pressed={c === x}
          className={`min-h-11 rounded-full px-4 font-medium transition-colors ${c === x
            ? tone === "dark" ? "bg-sun-400 text-brand-950" : "bg-brand-800 text-white"
            : tone === "dark" ? "text-brand-100 hover:text-white" : "text-stone-700 hover:text-stone-900"}`}
        >
          {x === "KES" ? "KES · Kenya" : "USD · International"}
        </button>
      ))}
    </div>
  );
}
