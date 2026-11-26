// Deal finder on a consultation: Faith's partner offers ranked for this client, a package that
// fits their budget, and one-click searches on big booking sites for anything else.
import Link from "next/link";
import type { OfferPick } from "@prisma/client";
import { CATEGORY_LABEL, UNIT_LABEL, outsideSearches, type ClientNeeds, type Fit, type Match, type Package } from "@/lib/deals";
import { SubmitButton } from "./SubmitButton";
import { markBooked, unmarkBooked } from "../_lib/actions";
import { fmtMoney } from "../_lib/format";
import { btn, h2 } from "../_lib/ui";

// budget fit: a dot plus words, like every other status in the admin
const FIT: Record<Fit, { label: string; dot: string }> = {
  fits: { label: "Fits budget", dot: "bg-emerald-600" },
  stretch: { label: "Slightly over", dot: "bg-sun-500" },
  over: { label: "Over budget", dot: "bg-rose-400" },
  unknown: { label: "No budget given", dot: "bg-stone-300" },
};

function Dot({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-stone-600">
      <span aria-hidden className={`size-2 rounded-full ${dot}`} />{children}
    </span>
  );
}

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

  const renderMatches = (items: Match[]) => {
    return (
      <ul className="mt-6 divide-y divide-stone-100 border-y border-stone-100">
        {items.map((m) => {
              const isBooked = booked.has(m.offer.id);
              return (
                <li key={m.offer.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 text-sm">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link href={`/admin/offers/${m.offer.id}`} className="font-medium text-stone-900 underline-offset-4 hover:text-brand-800 hover:underline">{m.offer.title}</Link>
                      <Dot dot={FIT[m.fit].dot}>{FIT[m.fit].label}</Dot>
                      {isBooked && <Dot dot="bg-brand-600">Booked</Dot>}
                    </p>
                    <p className="mt-0.5 text-[13px] text-stone-500">{CATEGORY_LABEL[m.offer.category]} · {m.offer.partner} · {m.offer.location}</p>
                    <p className="mt-1.5 text-stone-700 tabular-nums">
                      <span className="font-medium text-stone-900">{fmtMoney(m.totalKes, "KES")}</span> for the group
                      <span className="whitespace-nowrap text-stone-500"> · {fmtMoney(m.offer.priceKes, "KES")} {UNIT_LABEL[m.offer.unit]}</span>
                      {m.commissionKes > 0 && <span className="whitespace-nowrap text-stone-500"> · commission {fmtMoney(m.commissionKes, "KES")}</span>}
                    </p>
                    {m.reasons.length > 0 && <p className="mt-0.5 text-[13px] text-stone-500">{m.reasons.join(" · ")}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {m.offer.bookingUrl && (
                      <a href={m.offer.bookingUrl} target="_blank" rel="noreferrer" className={btn.quiet}>Open<span className="sr-only"> {m.offer.title} (new tab)</span></a>
                    )}
                    {isBooked ? (
                      <form action={unmarkBooked.bind(null, enquiryId, m.offer.id)}>
                        <SubmitButton pendingLabel="Saving…" className={btn.quiet}>Undo booked</SubmitButton>
                      </form>
                    ) : (
                      <form action={markBooked.bind(null, enquiryId, m.offer.id, m.totalKes, m.commissionKes)}>
                        <SubmitButton pendingLabel="Saving…" className={btn.secondary}>Mark booked</SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
      </ul>
    );
  };

  return (
    <section aria-labelledby="deals-h" className="border-t border-stone-200 pt-10">
      <h2 id="deals-h" className={h2}>Deals for {firstName}</h2>
      <p className="mt-1 text-sm text-stone-500">
        {needs.destination || "No destination yet"} · {people} {people === 1 ? "person" : "people"} · {needs.nights} night{needs.nights === 1 ? "" : "s"} · budget {budget} per person
      </p>

      {!hasOffers ? (
        <p className="mt-5 text-sm text-stone-600">
          You haven&apos;t added any partner offers yet. <Link href="/admin/offers/new" className="text-brand-700 underline underline-offset-4">Add your first offer</Link> and it will be matched to clients automatically.
        </p>
      ) : matches.length === 0 ? (
        <p className="mt-5 text-sm text-stone-600">No partner offers in {needs.destination || "this place"} yet. Try the searches below, then add the good ones as offers.</p>
      ) : (
        <>
          {pkg.items.length > 0 && (
            <div className="mt-5 rounded-xl bg-sand-50 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-900">Suggested package</h3>
                {pkg.withinBudget !== null && (
                  <Dot dot={pkg.withinBudget ? "bg-emerald-600" : "bg-sun-500"}>{pkg.withinBudget ? "Within budget" : "Over budget"}</Dot>
                )}
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {pkg.items.map((m) => (
                  <li key={m.offer.id} className="flex flex-wrap justify-between gap-x-4">
                    <span><span className="text-stone-500">{CATEGORY_LABEL[m.offer.category]}</span> <span className="text-stone-900">{m.offer.title}</span></span>
                    <span className="tabular-nums">{fmtMoney(m.totalKes, "KES")}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex flex-wrap justify-between gap-x-4 border-t border-sand-200 pt-3 text-sm tabular-nums">
                <span><span className="font-semibold">{fmtMoney(pkg.totalKes, "KES")}</span> <span className="text-stone-500">· {fmtMoney(pkg.perPersonKes, "KES")} per person</span></span>
                <span className="text-stone-600">Your commission about <span className="font-medium text-stone-900">{fmtMoney(pkg.commissionKes, "KES")}</span></span>
              </p>
              <p className="mt-2 text-[13px] text-stone-500">To send it, pick &ldquo;Send suggested package&rdquo; in the reply box.</p>
            </div>
          )}

          {renderMatches(matches.slice(0, 5))}
          {matches.length > 5 && (
            <details className="group">
              <summary className="mt-3 inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 -ml-2 text-sm text-brand-700 hover:bg-sand-100 [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show {Math.min(matches.length, 10) - 5} more</span>
                <span className="hidden group-open:inline">Show fewer</span>
              </summary>
              {renderMatches(matches.slice(5, 10))}
            </details>
          )}
        </>
      )}

      <div className="mt-6">
        <p className="text-sm text-stone-500">Search beyond your partners, with {firstName}&apos;s place and group filled in:</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {outsideSearches(needs).map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              className="inline-flex h-8 items-center rounded-full border border-stone-200 px-3 text-[13px] text-stone-700 transition-[background-color,border-color] duration-150 hover:border-stone-300 hover:bg-sand-50">
              {s.label}<span className="sr-only"> (new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
