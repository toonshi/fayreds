"use client";
// OWNER: Faith. Reservation form for one trip. Renders forms.reservation from src/lib/forms.ts and
// posts the EnquiryRequest contract. Can be swapped for the shared <FormRenderer kind="reservation"> (task F4) later.
import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, forms, type Field } from "@/lib/forms";
import { isKenyanClient, normalisePhone } from "@/lib/phone";
import type { EnquiryRequest, EnquiryResponse } from "@/types/contracts";
import { formatKes, formatUsd } from "./currency";

type Prices = { priceKes: number; priceUsd: number; depositKes: number; depositUsd: number };
type Values = Record<string, string>;

const inputCls = (bad: boolean) =>
  `mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-stone-900 outline-none transition focus:ring-2 ${
    bad ? "border-rose-500 focus:ring-rose-500/20" : "border-stone-300 focus:border-ocean-700 focus:ring-ocean-700/20"
  }`;

export function ReservationForm({ tripSlug, tripTitle, prices, spotsLeft }: { tripSlug: string; tripTitle: string; prices: Prices; spotsLeft: number }) {
  const router = useRouter();
  const uid = useId();
  const fields = forms.reservation.sections.flatMap((s) => s.fields);
  const [values, setValues] = useState<Values>({ spots: "1", payOption: "Deposit" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [sending, setSending] = useState(false);

  const set = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
      if (Object.keys(next).length === 0) setMessage(undefined); // everything fixed: drop the banner
    }
  };

  // what they'll pay next: currency follows the country / phone they enter
  const summary = useMemo(() => {
    const phone = normalisePhone(values.phone ?? "") ?? "";
    const kenyan = values.country ? isKenyanClient(values.country, phone) : phone ? isKenyanClient("", phone) : null;
    const spots = Math.min(Math.max(1, Number(values.spots) || 1), 10);
    const deposit = values.payOption !== "Full amount";
    const kes = (deposit ? prices.depositKes : prices.priceKes) * spots;
    const usd = (deposit ? prices.depositUsd : prices.priceUsd) * spots;
    return { kenyan, spots, deposit, kes, usd };
  }, [values, prices]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setMessage(undefined);
    const body: EnquiryRequest = {
      kind: "reservation",
      tripSlug,
      values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, fields.find((f) => f.name === k)?.type === "number" ? Number(v) : v])),
      website_url: String(new FormData(e.currentTarget).get("website_url") ?? ""),
    };
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as EnquiryResponse;
      if (data.ok) {
        router.push(data.redirectTo);
        return;
      }
      setErrors(data.errors ?? {});
      setMessage(res.status === 429 ? "Too many attempts. Please wait a minute and try again." : data.message ?? "Please check the form.");
      const first = Object.keys(data.errors ?? {})[0];
      if (first) document.getElementById(`${uid}-${first}`)?.focus();
    } catch {
      setMessage("We couldn't reach the server. Check your connection and try again.");
    }
    setSending(false);
  }

  const control = (f: Field) => {
    const id = `${uid}-${f.name}`;
    const bad = !!errors[f.name];
    const common = {
      id, name: f.name, required: f.required, value: values[f.name] ?? "",
      "aria-invalid": bad, "aria-describedby": bad ? `${id}-err` : f.help ? `${id}-help` : undefined,
      className: inputCls(bad),
    };
    switch (f.type) {
      case "textarea":
        return <textarea {...common} rows={3} onChange={(e) => set(f.name, e.target.value)} />;
      case "select":
      case "country": {
        const opts = f.type === "country" ? COUNTRIES : f.options!;
        return (
          <select {...common} onChange={(e) => set(f.name, e.target.value)}>
            <option value="" disabled>Choose…</option>
            {opts.map((o) => <option key={o}>{o}</option>)}
          </select>
        );
      }
      case "number":
        return <input {...common} type="number" inputMode="numeric" min={f.min} max={Math.min(f.max ?? 10, spotsLeft)} onChange={(e) => set(f.name, e.target.value)} />;
      default:
        return (
          <input {...common} type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"} placeholder={f.placeholder}
            autoComplete={f.name === "name" ? "name" : f.name === "email" ? "email" : f.name === "phone" ? "tel" : undefined}
            onChange={(e) => set(f.name, e.target.value)} />
        );
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-label={`Reserve a spot on ${tripTitle}`}>
      {/* honeypot: hidden from people, bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>Leave this empty <input name="website_url" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {message && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={`${uid}-${f.name}`} className="text-sm font-medium text-stone-800">
              {f.label}{f.required && <span className="text-rose-600" aria-hidden> *</span>}
            </label>
            {control(f)}
            {errors[f.name] ? (
              <p id={`${uid}-${f.name}-err`} className="mt-1 text-sm text-rose-700">{errors[f.name]}</p>
            ) : f.help ? (
              <p id={`${uid}-${f.name}-help`} className="mt-1 text-xs text-stone-500">{f.help}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-ocean-50 p-4 text-sm text-ocean-950 ring-1 ring-ocean-100" aria-live="polite">
        <p className="font-semibold">
          To pay now: {summary.kenyan === null
            ? `${formatKes(summary.kes)} / ${formatUsd(summary.usd)}`
            : summary.kenyan ? `${formatKes(summary.kes)} by M-Pesa` : `${formatUsd(summary.usd)} by card`}
        </p>
        <p className="mt-0.5 text-ocean-900/80">
          {summary.deposit ? "Deposit" : "Full amount"} × {summary.spots} spot{summary.spots > 1 ? "s" : ""}.
          {summary.deposit && " Faith will share when the balance is due."}
        </p>
      </div>

      <button disabled={sending} className="w-full rounded-full bg-ocean-800 px-6 py-3.5 font-semibold text-white transition hover:bg-ocean-900 disabled:opacity-60 sm:w-auto">
        {sending ? "Reserving…" : "Continue to payment"}
      </button>
      <p className="text-xs text-stone-500">You&apos;ll get an SMS (Kenyan numbers) and an email confirming your reservation.</p>
    </form>
  );
}
