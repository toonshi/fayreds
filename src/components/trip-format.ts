// OWNER: Faith. Date helpers for trip pages (dates shown in Kenyan time).
const opts = { timeZone: "Africa/Nairobi" } as const;

export function tripDates(start: Date, end: Date) {
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  const s = start.toLocaleDateString("en-GB", { ...opts, day: "numeric", ...(sameMonth ? {} : { month: "short" }) });
  const e = end.toLocaleDateString("en-GB", { ...opts, day: "numeric", month: "short", year: "numeric" });
  return `${s}–${e}`;
}

export function nights(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}
