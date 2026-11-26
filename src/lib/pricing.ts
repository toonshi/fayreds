// OWNER: Mike. Working first version so /pay can show amounts today.
import type { Enquiry, Trip } from "@prisma/client";
import { site } from "./site";
import { isKenyanClient } from "./phone";
import type { Quote } from "@/types/contracts";

export function quoteFor(enquiry: Enquiry & { trip?: Trip | null }): Quote {
  const kenyan = isKenyanClient(enquiry.country, enquiry.phone);
  const currency = kenyan ? "KES" : "USD";

  if (enquiry.type === "CONSULTATION") {
    return { currency, amount: kenyan ? site.consultation.priceKes : site.consultation.priceUsd, label: "Travel consultation" };
  }
  if (enquiry.type === "RESERVATION" && enquiry.trip) {
    const t = enquiry.trip;
    const spots = enquiry.spots ?? 1;
    const deposit = (enquiry.details as Record<string, unknown>)?.payOption === "Deposit";
    const each = kenyan ? (deposit ? t.depositKes : t.priceKes) : deposit ? t.depositUsd : t.priceUsd;
    return { currency, amount: each * spots, label: `${t.title}: ${deposit ? "deposit" : "full payment"} × ${spots}` };
  }
  throw new Error(`Nothing to pay for enquiry ${enquiry.reference}`);
}

export const formatMoney = (q: Pick<Quote, "currency" | "amount">) =>
  q.currency === "KES" ? `KES ${q.amount.toLocaleString("en-KE")}` : `$${q.amount.toLocaleString("en-US")}`;
