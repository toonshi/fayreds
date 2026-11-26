"use client";
// OWNER: Faith. Reservation form for one trip = the shared FormRenderer + a live "to pay now" summary.
import { FormRenderer, type FormValues } from "./FormRenderer";
import { isKenyanClient, normalisePhone } from "@/lib/phone";
import { formatKes, formatUsd, useCurrency } from "./currency";

type Prices = { priceKes: number; priceUsd: number; depositKes: number; depositUsd: number };

function Summary({ values, prices }: { values: FormValues; prices: Prices }) {
  const chosen = useCurrency();
  const phone = normalisePhone(String(values.phone ?? "")) ?? "";
  const country = String(values.country ?? "");
  // country/phone decide how they'll pay; before they're filled in, follow the currency toggle
  const kenyan = country ? isKenyanClient(country, phone) : phone ? isKenyanClient("", phone) : chosen ? chosen === "KES" : null;
  const spots = Math.min(Math.max(1, Number(values.spots) || 1), 10);
  const deposit = values.payOption !== "Full amount";
  const kes = (deposit ? prices.depositKes : prices.priceKes) * spots;
  const usd = (deposit ? prices.depositUsd : prices.priceUsd) * spots;
  return (
    <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-950 ring-1 ring-brand-100" aria-live="polite">
      <p className="font-semibold tabular-nums">
        To pay now: {kenyan === null ? `${formatKes(kes)} / ${formatUsd(usd)}` : kenyan ? `${formatKes(kes)} by M-Pesa` : `${formatUsd(usd)} by card`}
      </p>
      <p className="mt-0.5 text-brand-900/80">
        {deposit ? "Deposit" : "Full amount"} × {spots} spot{spots > 1 ? "s" : ""}.{deposit && " Faith will share when the balance is due."}
      </p>
    </div>
  );
}

export function ReservationForm({ tripSlug, prices, spotsLeft }: { tripSlug: string; tripTitle?: string; prices: Prices; spotsLeft: number }) {
  return (
    <FormRenderer
      kind="reservation"
      tripSlug={tripSlug}
      compact
      submitLabel="Continue to payment"
      initialValues={{ spots: "1", payOption: "Deposit" }}
      fieldOverrides={{ spots: { max: Math.min(10, spotsLeft) } }}
      renderSummary={(v) => <Summary values={v} prices={prices} />}
      footnote="You'll get an SMS (Kenyan numbers) and an email confirming your reservation."
    />
  );
}
