// Deal finder: Faith's partner offers, and the commission earned from them.
import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { CATEGORY_LABEL, UNIT_LABEL } from "@/lib/deals";
import { Badge } from "../../_components/Badge";
import { SubmitButton } from "../../_components/SubmitButton";
import { SavedNotice } from "../../_components/SavedNotice";
import { toggleOffer } from "../../_lib/actions";
import { fmtMoney } from "../../_lib/format";

export default async function OffersPage() {
  const [offers, earned] = await Promise.all([
    db.offer.findMany({ orderBy: [{ active: "desc" }, { category: "asc" }, { priceKes: "asc" }], include: { picks: { where: { status: "BOOKED" } } } }),
    db.offerPick.aggregate({ where: { status: "BOOKED" }, _sum: { commissionKes: true, amountKes: true }, _count: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deals</h1>
          <p className="max-w-2xl text-sm text-stone-600">
            Your partner offers. Each consultation automatically shows the ones that fit the client&apos;s place, budget, group and interests.
          </p>
        </div>
        <Link href="/admin/offers/new" className="inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">+ New offer</Link>
      </div>
      <Suspense><SavedNotice /></Suspense>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200"><dt className="text-xs text-stone-600">Active offers</dt><dd className="text-2xl font-bold tabular-nums">{offers.filter((o) => o.active).length}</dd></div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200"><dt className="text-xs text-stone-600">Bookings through you</dt><dd className="text-2xl font-bold tabular-nums">{earned._count}</dd><dd className="text-xs text-stone-600 tabular-nums">{fmtMoney(earned._sum.amountKes ?? 0, "KES")} in sales</dd></div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200"><dt className="text-xs text-stone-600">Commission earned (estimated)</dt><dd className="text-2xl font-bold tabular-nums text-teal-800">{fmtMoney(earned._sum.commissionKes ?? 0, "KES")}</dd></div>
      </dl>

      {offers.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center ring-1 ring-stone-200">
          <p className="font-semibold">Add your first partner offer</p>
          <p className="mt-1 text-sm text-stone-600">Hotels, Airbnbs, paragliding, transfers, restaurants: anything you book for clients.</p>
          <Link href="/admin/offers/new" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">+ New offer</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs text-stone-600">
              <tr><th className="p-3">Offer</th><th className="p-3">Type</th><th className="p-3">Where</th><th className="p-3">Price</th><th className="p-3">Commission</th><th className="p-3">Booked</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {offers.map((o) => (
                <tr key={o.id} className={o.active ? "" : "text-stone-400"}>
                  <td className="p-3">
                    <Link href={`/admin/offers/${o.id}`} className="font-semibold text-teal-800 hover:underline">{o.title}</Link>
                    <span className="block text-xs text-stone-600">{o.partner}</span>
                  </td>
                  <td className="p-3">{CATEGORY_LABEL[o.category]}</td>
                  <td className="p-3">{o.location}</td>
                  <td className="p-3 tabular-nums">{fmtMoney(o.priceKes, "KES")}<span className="block text-xs text-stone-600">{UNIT_LABEL[o.unit]}</span></td>
                  <td className="p-3 tabular-nums">{o.commissionPct}%</td>
                  <td className="p-3 tabular-nums">{o.picks.length}<span className="block text-xs text-stone-600">{fmtMoney(o.picks.reduce((n, p) => n + p.commissionKes, 0), "KES")}</span></td>
                  <td className="p-3 text-right">
                    <form action={toggleOffer.bind(null, o.id)}>
                      <SubmitButton pendingLabel="…" className="text-stone-700 hover:bg-stone-100">{o.active ? "Switch off" : "Switch on"}</SubmitButton>
                    </form>
                    {!o.active && <Badge className="bg-gray-200 text-gray-700">Off</Badge>}
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
