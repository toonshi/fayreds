// Deal finder: Faith's partner offers, and the commission earned from them.
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { CATEGORY_LABEL, UNIT_LABEL } from "@/lib/deals";
import { SubmitButton } from "../../_components/SubmitButton";
import { SavedNotice } from "../../_components/SavedNotice";
import { toggleOffer } from "../../_lib/actions";
import { fmtMoney } from "../../_lib/format";
import { btn } from "../../_lib/ui";

export default async function OffersPage() {
  const [offers, earned] = await Promise.all([
    db.offer.findMany({ orderBy: [{ active: "desc" }, { category: "asc" }, { priceKes: "asc" }], include: { picks: { where: { status: "BOOKED" } } } }),
    db.offerPick.aggregate({ where: { status: "BOOKED" }, _sum: { commissionKes: true, amountKes: true }, _count: true }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Deals</h1>
          <p className="mt-1.5 max-w-xl text-sm text-pretty text-stone-600">
            Your partner offers. Each consultation shows the ones that fit the client&apos;s place, budget, group and interests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense><SavedNotice /></Suspense>
          <Link href="/admin/offers/new" className={btn.primary}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            New offer
          </Link>
        </div>
      </div>

      {/* what the partnerships have earned: one line of three numbers */}
      <dl className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
        <div>
          <dt className="text-sm text-stone-500">Commission earned (estimated)</dt>
          <dd className="mt-1.5 text-2xl font-semibold tabular-nums">{fmtMoney(earned._sum.commissionKes ?? 0, "KES")}</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Bookings through you</dt>
          <dd className="mt-1.5 text-2xl font-semibold tabular-nums">{earned._count}</dd>
          <dd className="mt-0.5 text-sm text-stone-600 tabular-nums">{fmtMoney(earned._sum.amountKes ?? 0, "KES")} in sales</dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Active offers</dt>
          <dd className="mt-1.5 text-2xl font-semibold tabular-nums">{offers.filter((o) => o.active).length}</dd>
        </div>
      </dl>

      {offers.length === 0 ? (
        <div className="mt-12 border-t border-stone-200 py-20 text-center">
          <p className="text-[15px] font-medium text-stone-900">Add your first partner offer</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-stone-500">Hotels, Airbnbs, paragliding, transfers, restaurants: anything you book for clients. Consultations then suggest them automatically.</p>
          <Link href="/admin/offers/new" className={`${btn.primary} mt-5`}>New offer</Link>
        </div>
      ) : (
        <div className="mt-12 overflow-x-auto border-t border-stone-200">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-stone-500">
              <tr className="border-b border-stone-100">
                <th scope="col" className="py-3 pr-6 font-normal">Offer</th>
                <th scope="col" className="py-3 pr-6 font-normal">Where</th>
                <th scope="col" className="py-3 pr-6 text-right font-normal">Price</th>
                <th scope="col" className="py-3 pr-6 text-right font-normal">Commission</th>
                <th scope="col" className="py-3 pr-6 text-right font-normal">Booked</th>
                <th scope="col" className="py-3"><span className="sr-only">On or off</span></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className={`border-b border-stone-100 last:border-0 ${o.active ? "" : "text-stone-400"}`}>
                  <td className="py-3.5 pr-6">
                    <Link href={`/admin/offers/${o.id}`} className={`font-medium underline-offset-4 hover:text-brand-800 hover:underline ${o.active ? "text-stone-900" : "text-stone-500"}`}>{o.title}</Link>
                    <span className="mt-0.5 block text-[13px] text-stone-500">{CATEGORY_LABEL[o.category]} · {o.partner}</span>
                  </td>
                  <td className="py-3.5 pr-6">{o.location}</td>
                  <td className="py-3.5 pr-6 text-right whitespace-nowrap tabular-nums">
                    {fmtMoney(o.priceKes, "KES")}
                    <span className="block text-[13px] text-stone-500">{UNIT_LABEL[o.unit]}</span>
                  </td>
                  <td className="py-3.5 pr-6 text-right tabular-nums">{o.commissionPct}%</td>
                  <td className="py-3.5 pr-6 text-right whitespace-nowrap tabular-nums">
                    {o.picks.length}
                    <span className="block text-[13px] text-stone-500">{fmtMoney(o.picks.reduce((n, p) => n + p.commissionKes, 0), "KES")}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <form action={toggleOffer.bind(null, o.id)} className="flex items-center justify-end gap-2">
                      {!o.active && <span className="text-sm text-stone-500">Off</span>}
                      <SubmitButton pendingLabel="Saving…" className={btn.quiet}>
                        {o.active ? "Switch off" : "Switch on"}<span className="sr-only"> {o.title}</span>
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
