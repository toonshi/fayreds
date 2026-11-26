"use client";
// OWNER: Faith. The quick "plan your trip" bar under the hero: where / when / how many.
// It opens the consultation form with those answers already filled in.
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Icon } from "./Icon";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function TripPlanner() {
  const router = useRouter();
  const uid = useId();
  const now = new Date();
  // the next 12 months, e.g. "December 2026"
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("2");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (where.trim()) q.set("destination", where.trim());
    if (when) q.set("dates", when);
    if (who) q.set("adults", who);
    router.push(`/consultation${q.size ? `?${q}` : ""}#plan`);
  }

  const field = "flex min-w-0 flex-1 items-center gap-3 px-5 py-3 sm:py-4";
  const input = "w-full min-w-0 bg-transparent text-base text-stone-900 placeholder:text-stone-500 outline-none";
  return (
    <form onSubmit={go} aria-label="Plan your trip"
      className="flex flex-col divide-y divide-stone-200 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-brand-950/20 ring-1 ring-black/5 sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0 sm:rounded-full">
      <label htmlFor={`${uid}-where`} className={field}>
        <Icon name="pin" className="h-5 w-5 text-brand-700" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Where to?</span>
          <input id={`${uid}-where`} value={where} onChange={(e) => setWhere(e.target.value)} placeholder="e.g. Zanzibar, Diani…" className={input} autoComplete="off" />
        </span>
      </label>
      <label htmlFor={`${uid}-when`} className={field}>
        <Icon name="calendar" className="h-5 w-5 text-brand-700" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">When?</span>
          <select id={`${uid}-when`} value={when} onChange={(e) => setWhen(e.target.value)} className={`${input} appearance-none ${when ? "" : "text-stone-500"}`}>
            <option value="">Any time</option>
            {months.map((m) => <option key={m} className="text-stone-900">{m}</option>)}
          </select>
        </span>
      </label>
      <label htmlFor={`${uid}-who`} className={`${field} sm:max-w-44`}>
        <Icon name="users" className="h-5 w-5 text-brand-700" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">Travellers</span>
          <select id={`${uid}-who`} value={who} onChange={(e) => setWho(e.target.value)} className={`${input} appearance-none tabular-nums`}>
            {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>{n} {n === "1" ? "adult" : "adults"}</option>)}
          </select>
        </span>
      </label>
      <div className="p-2 sm:pl-0">
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sun-400 px-6 font-semibold text-brand-950 transition-[background-color,scale] hover:bg-sun-300 active:scale-[0.97] sm:h-full sm:rounded-full">
          <Icon name="search" className="h-5 w-5" /> Plan with Faith
        </button>
      </div>
    </form>
  );
}
