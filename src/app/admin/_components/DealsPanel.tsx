// Deal finder on a consultation: Faith's partner offers ranked for this client, a package that
// fits their budget, and one-click searches on big booking sites for anything else.
import Link from "next/link";
import type { OfferPick } from "@prisma/client";
import { CATEGORY_LABEL, UNIT_LABEL, outsideSearches, type ClientNeeds, type Fit, type Match, type Package } from "@/lib/deals";
import { Badge } from "./Badge";
import { SubmitButton } from "./SubmitButton";
import { markBooked, unmarkBooked } from "../_lib/actions";
import { fmtMoney } from "../_lib/format";

const FIT: Record<Fit, { label: string; cls: string }> = {
  fits: { label: "Fits budget", cls: "bg-emerald-100 text-emerald-800" },
  stretch: { label: "Slightly over", cls: "bg-amber-100 text-amber-800" },
  over: { label: "Over budget", cls: "bg-rose-100 text-rose-800" },
  unknown: { label: "No budget given", cls: "bg-gray-200 text-gray-700" },
};

export function DealsPanel({ enquiryId, firstName, needs, matches, pkg, picks, hasOffers }: {
  enquiryId: string;
  firstName: string;
  needs: ClientNeeds;
  matches: Match[];
  pkg: Package;
  picks: OfferPick[];
  hasOffers: boolean;
}) {
  const people = needs.adults + needs.children;
  const booked = new Set(picks.filter((p) => p.status === "BOOKED").map((p) => p.offerId));
  const budget = needs.budgetPerPerson === null ? "not sure" : needs.budgetPerPerson === Infinity ? "above KES 200,000" : `up to ${fmtMoney(needs.budgetPerPerson, "KES")}`;

  return (
    <section className="space-y-5 rounded-xl bg-white p-5 ring-1 ring-stone-200" aria-labelledby="deals">
      <div>
        <h2 id="deals" className="font-semibold">Best deals for {firstName}</h2>
        <p className="mt-1 text-sm text-stone-600">
          {needs.destination || "No destination yet"} · {people} {people === 1 ? "person" : "people"} · {needs.nights} night{needs.nights === 1 ? "" : "s"} · budget {budget} per person
        </p>
      </div>

      {!hasOffers ? (
        <p className="rounded-lg bg-stone-50 p-4 text-sm">
          You haven&apos;t added any partner offers yet. <Link href="/admin/offers/new" className="font-semibold text-teal-800 underline">Add your first offer</Link> and it will be matched to clients automatically.
        </p>
      ) : matches.length === 0 ? (
        <p className="rounded-lg bg-stone-50 p-4 text-sm">No partner offers in {needs.destination || "this place"} yet. Use the searches below, then add the good ones as offers.</p>
      ) : (
        <>
          {pkg.items.length > 0 && (
            <div className="rounded-lg bg-teal-50 p-4 ring-1 ring-teal-100">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-teal-900">Suggested package</h3>
                {pkg.withinBudget !== null && (
                  <Badge className={pkg.withinBudget ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {pkg.withinBudget ? "Within budget" : "Over budget"}
                  </Badge>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {pkg.items.map((m) => (
                  <li key={m.offer.id} className="flex flex-wrap justify-between gap-x-4">
                    <span>{CATEGORY_LABEL[m.offer.category]}: <strong>{m.offer.title}</strong> <span className="text-stone-600">({m.offer.partner})</span></span>
                    <span className="tabular-nums">{fmtMoney(m.totalKes, "KES")}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-teal-100 pt-2 text-sm tabular-nums">
                Total <strong>{fmtMoney(pkg.totalKes, "KES")}</strong> · {fmtMoney(pkg.perPersonKes, "KES")} per person · your commission about <strong>{fmtMoney(pkg.commissionKes, "KES")}</strong>
              </p>
              <p className="mt-1 text-xs text-teal-900/80">To send it, choose &ldquo;Send suggested package&rdquo; in the reply box above.</p>
            </div>
          )}

          <ul className="divide-y divide-stone-100">
            {matches.slice(0, 10).map((m) => {
              const isBooked = booked.has(m.offer.id);
              return (
                <li key={m.offer.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/offers/${m.offer.id}`} className="font-semibold text-teal-800 hover:underline">{m.offer.title}</Link>
                      <Badge className={FIT[m.fit].cls}>{FIT[m.fit].label}</Badge>
                      {isBooked && <Badge className="bg-teal-100 text-teal-800">Booked</Badge>}
                    </p>
                    <p className="text-xs text-stone-600">{CATEGORY_LABEL[m.offer.category]} · {m.offer.partner} · {m.offer.location}</p>
                    <p className="mt-1 text-sm tabular-nums">
                      {fmtMoney(m.offer.priceKes, "KES")} {UNIT_LABEL[m.offer.unit]} → <strong>{fmtMoney(m.totalKes, "KES")}</strong> for the group ({fmtMoney(m.perPersonKes, "KES")} each)
                      {m.commissionKes > 0 && <span className="text-teal-800"> · commission {fmtMoney(m.commissionKes, "KES")}</span>}
                    </p>
                    {m.reasons.length > 0 && <p className="text-xs text-stone-500">Why: {m.reasons.join(" · ")}</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 text-sm">
                    {m.offer.bookingUrl && (
                      <a href={m.offer.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-stone-300 px-3 hover:bg-stone-50">Open ↗</a>
                    )}
                    {isBooked ? (
                      <form action={unmarkBooked.bind(null, enquiryId, m.offer.id)}>
                        <SubmitButton pendingLabel="…" className="text-stone-700 hover:bg-stone-100">Undo booked</SubmitButton>
                      </form>
                    ) : (
                      <form action={markBooked.bind(null, enquiryId, m.offer.id, m.totalKes, m.commissionKes)}>
                        <SubmitButton pendingLabel="Saving…" className="bg-teal-700 font-semibold text-white hover:bg-teal-800">Mark booked</SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="border-t border-stone-100 pt-4">
        <p className="text-sm text-stone-600">Search beyond your partners (opens with {firstName}&apos;s place and group filled in)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {outsideSearches(needs).map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-stone-300 px-4 text-sm hover:bg-stone-50">{s.label} ↗</a>
          ))}
        </div>
      </div>
    </section>
  );
}
