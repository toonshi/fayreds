// OWNER: Hendy. CSV downloads for Faith: /admin/export?kind=enquiries|payments (+ same filters as the pages)
import type { EnquiryStatus, EnquiryType, PaymentProvider, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { detailRows, statusLabel, typeLabel } from "../_lib/format";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const kind = sp.get("kind") === "payments" ? "payments" : "enquiries";
  const stamp = new Date().toISOString().slice(0, 10);
  let csv: string;

  if (kind === "enquiries") {
    const to = sp.get("to");
    const q = sp.get("q")?.trim();
    const rows = await db.enquiry.findMany({
      where: {
        type: (sp.get("type") as EnquiryType) || undefined,
        status: (sp.get("status") as EnquiryStatus) || undefined,
        tripId: sp.get("trip") || undefined,
        createdAt: sp.get("from") || to
          ? { gte: sp.get("from") ? new Date(sp.get("from")!) : undefined, lt: to ? new Date(new Date(to).getTime() + 86_400_000) : undefined }
          : undefined,
        OR: q ? [
          { reference: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } },
        ] : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: { trip: { select: { title: true } } },
    });
    csv = toCsv([
      ["Reference", "Received", "Type", "Status", "Name", "Email", "Phone", "Country", "Trip", "Spots", "Answers", "Notes"],
      ...rows.map((e) => [
        e.reference, e.createdAt, typeLabel(e.type), statusLabel(e.status), e.name, e.email, e.phone, e.country,
        e.trip?.title ?? "", e.spots ?? "", detailRows(e.type, e.details).map(([k, v]) => `${k}: ${v}`).join("\n"), e.notes ?? "",
      ]),
    ]);
  } else {
    const rows = await db.payment.findMany({
      where: {
        provider: (sp.get("provider") as PaymentProvider) || undefined,
        status: (sp.get("status") as PaymentStatus) || undefined,
      },
      orderBy: { createdAt: "desc" },
      include: { enquiry: true },
    });
    csv = toCsv([
      ["Date", "Paid at", "Enquiry reference", "Client", "Phone", "For", "Method", "Status", "Currency", "Amount", "M-Pesa receipt", "Stripe session", "Description"],
      ...rows.map((p) => [
        p.createdAt, p.paidAt ?? "", p.enquiry.reference, p.enquiry.name, p.enquiry.phone, typeLabel(p.enquiry.type),
        p.provider === "MPESA" ? "M-Pesa" : "Card", p.status, p.currency, p.amount, p.mpesaReceipt ?? "", p.stripeSessionId ?? "", p.description,
      ]),
    ]);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fayreds-${kind}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
