// OWNER: Mike. Saving enquiries. Working first version; Mike hardens it.
import type { EnquiryType, Prisma } from "@prisma/client";
import { db } from "./db";
import { allFields, type FormKind } from "./forms";

const TYPE: Record<FormKind, EnquiryType> = {
  marketing: "MARKETING",
  consultation: "CONSULTATION",
  partnership: "PARTNERSHIP",
  reservation: "RESERVATION",
};
const PREFIX: Record<FormKind, string> = { marketing: "MKT", consultation: "CON", partnership: "PRT", reservation: "TRP" };

export function makeReference(kind: FormKind) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I, easy to read out on the phone
  const code = Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => chars[b % chars.length]).join("");
  return `FT-${PREFIX[kind]}-${code}`;
}

export const needsPayment = (kind: FormKind) => kind === "consultation" || kind === "reservation";

export async function createEnquiry(opts: {
  kind: FormKind;
  values: Record<string, string | string[] | number>;
  phone: string;
  tripId?: string;
}) {
  const { kind, values } = opts;
  const contactKeys = ["name", "email", "phone", "country"];
  // keep the remaining answers in "details", keyed by field name (labels come from forms.ts when displaying)
  const details: Record<string, string | string[] | number> = {};
  for (const f of allFields(kind)) {
    if (!contactKeys.includes(f.name) && values[f.name] !== undefined) details[f.name] = values[f.name];
  }
  return db.enquiry.create({
    data: {
      reference: makeReference(kind),
      type: TYPE[kind],
      status: needsPayment(kind) ? "AWAITING_PAYMENT" : "NEW",
      name: String(values.name),
      email: String(values.email),
      phone: opts.phone,
      country: String(values.country),
      details: details as Prisma.InputJsonValue,
      tripId: opts.tripId,
      spots: kind === "reservation" ? Number(values.spots) : null,
    },
  });
}
