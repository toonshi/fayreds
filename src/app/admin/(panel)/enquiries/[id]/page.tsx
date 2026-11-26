import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { site, siteUrl } from "@/lib/site";
import { isKenyanPhone } from "@/lib/phone";
import { CATEGORY_LABEL, matchOffers, needsFromDetails, suggestPackage } from "@/lib/deals";
import { BackLink } from "../../../_components/BackLink";
import { ContactButtons } from "../../../_components/ContactButtons";
import { DealsPanel } from "../../../_components/DealsPanel";
import { NotesForm } from "../../../_components/NotesForm";
import { ReplyForm } from "../../../_components/ReplyForm";
import { StatusLabel } from "../../../_components/StatusLabel";
import { StatusSelect } from "../../../_components/StatusSelect";
import {
  contactPref, detailGroups, fmtDate, fmtDateTime, fmtPayment, messageOf, paymentStatusLabel, plural, relTime, typeLabel,
} from "../../../_lib/format";
import { h2 } from "../../../_lib/ui";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await db.enquiry.findUnique({
    where: { id },
    include: { trip: true, payments: { orderBy: { createdAt: "desc" } }, offerPicks: true },
  });
  if (!e) notFound();

  const firstName = e.name.split(" ")[0];
  const what = typeLabel(e.type).toLowerCase();
  const pref = contactPref(e);

  // deal finder (consultations only)
  const isConsult = e.type === "CONSULTATION";
  const offers = isConsult ? await db.offer.findMany({ where: { active: true } }) : [];
  const needs = needsFromDetails(e.details);
  const matches = isConsult ? matchOffers(offers, needs) : [];
  const pkg = suggestPackage(matches, needs);
  const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;
  const packageText = pkg.items.length
    ? `Hi ${firstName}, here is a plan for ${needs.destination || "your trip"} that fits your budget:\n` +
      pkg.items.map((m) => `- ${CATEGORY_LABEL[m.offer.category]}: ${m.offer.title}, ${kes(m.totalKes)}${m.offer.bookingUrl ? ` (${m.offer.bookingUrl})` : ""}`).join("\n") +
      `\nTotal about ${kes(pkg.totalKes)} (${kes(pkg.perPersonKes)} per person). Shall I book it for you? Faith, ${site.name}`
    : null;

  const unpaid = (e.type === "CONSULTATION" || e.type === "RESERVATION") && !e.payments.some((p) => p.status === "PAID");
  const templates = [
    ...(packageText ? [{ label: "Send suggested package", text: packageText }] : []),
    { label: "Thanks, I'll be in touch", text: `Hi ${firstName}, thank you for your ${what} request (${e.reference}). I've read it and I'll get back to you shortly. Faith, ${site.name}` },
    { label: "Ask for a call", text: `Hi ${firstName}, thanks for reaching out about your ${what} request (${e.reference}). When is a good time for a quick call this week? Faith, ${site.name}` },
    ...(unpaid ? [{ label: "Payment reminder", text: `Hi ${firstName}, your ${what} (${e.reference}) is waiting for payment. You can pay here: ${siteUrl(`/pay/${e.reference}`)} Faith, ${site.name}` }] : []),
    ...(e.type === "MARKETING" || e.type === "PARTNERSHIP" ? [{ label: "Send my rates", text: `Hi ${firstName}, thank you for your interest in working together. I'll email you my rates and media kit today. Faith, ${site.name}` }] : []),
  ];
  const smsAvailable = isKenyanPhone(e.phone) || process.env.SMS_INTERNATIONAL === "true";
  const message = messageOf(e.details);
  const groups = detailGroups(e.type, e.details);

  return (
    <div>
      <BackLink href="/admin">Enquiries</BackLink>

      {/* who, what, and how to reach them: one block */}
      <header className="mt-4 flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words text-balance">{e.name}</h1>
          <p className="mt-1.5 text-sm text-stone-600">
            {typeLabel(e.type)} from {e.country}
            <span aria-hidden className="mx-2 text-stone-300">·</span>
            <time dateTime={e.createdAt.toISOString()} title={fmtDateTime(e.createdAt)}>{relTime(e.createdAt)}</time>
            <span aria-hidden className="mx-2 text-stone-300">·</span>
            <span translate="no" className="tabular-nums">{e.reference}</span>
          </p>
        </div>
        <StatusSelect id={e.id} status={e.status} />
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <ContactButtons name={e.name} phone={e.phone} email={e.email} reference={e.reference} what={what} pref={pref} />
        <p className="text-sm text-stone-500" title={pref.stated ? "The client chose this in the form" : "Not asked in this form: guessed from the phone number"}>
          {pref.stated ? `Prefers ${pref.via}` : `${pref.via} suggested`}
        </p>
      </div>

      <div className="mt-12 grid gap-y-14 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-x-12">
        {/* what they asked for: the main reading column */}
        <div className="space-y-10">
          {message && (
            <section aria-labelledby="msg-h">
              <h2 id="msg-h" className={h2}>Their message</h2>
              <p className="mt-3 max-w-prose rounded-xl bg-sand-50 px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap text-pretty break-words text-stone-800">{message}</p>
            </section>
          )}

          {e.trip && (
            <section aria-labelledby="trip-h">
              <h2 id="trip-h" className={h2}>Trip</h2>
              <dl className="mt-3 grid grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
                <dt className="text-stone-500">Trip</dt>
                <dd><Link href={`/admin/trips/${e.trip.id}`} className="text-brand-700 underline-offset-4 hover:underline">{e.trip.title}</Link> <span className="text-stone-500">· {fmtDate(e.trip.startDate)}</span></dd>
                {e.spots != null && <><dt className="text-stone-500">Spots</dt><dd className="tabular-nums">{plural(e.spots, "spot")}</dd></>}
              </dl>
            </section>
          )}

          {groups.map((g) => (
            <section key={g.title} aria-label={g.title}>
              <h2 className={h2}>{g.title}</h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] sm:gap-y-2.5">
                {g.rows.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="mt-2 text-stone-500 sm:mt-0">{label}</dt>
                    <dd className="whitespace-pre-wrap break-words text-stone-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {e.payments.length > 0 && (
            <section aria-labelledby="pay-h">
              <h2 id="pay-h" className={h2}>Payments</h2>
              <ul className="mt-3 divide-y divide-stone-100 border-y border-stone-100 text-sm">
                {e.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3">
                    <span className="w-28 font-medium tabular-nums">{fmtPayment(p)}</span>
                    <span className="text-stone-600">{p.provider === "MPESA" ? "M-Pesa" : "Card"}</span>
                    <StatusLabel status={p.status}>{paymentStatusLabel(p.status)}</StatusLabel>
                    <span className="ml-auto text-stone-500 tabular-nums">
                      {p.mpesaReceipt && <span translate="no" className="mr-3">{p.mpesaReceipt}</span>}
                      {p.failureReason && <span className="mr-3">{p.failureReason}</span>}
                      {fmtDateTime(p.paidAt ?? p.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isConsult && (
            <DealsPanel enquiryId={e.id} firstName={firstName} needs={needs} matches={matches} pkg={pkg} picks={e.offerPicks} hasOffers={offers.length > 0} />
          )}
        </div>

        {/* what Faith does about it */}
        <aside className="space-y-12 lg:border-l lg:border-stone-200 lg:pl-12" aria-label="Reply and notes">
          <ReplyForm id={e.id} firstName={firstName} reference={e.reference} smsAvailable={smsAvailable} templates={templates} />
          <NotesForm id={e.id} notes={e.notes ?? ""} />
        </aside>
      </div>
    </div>
  );
}
