"use server";
// OWNER: Hendy. Every action re-checks the admin session.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { checkPassword, createSession, deleteSession, requireAdmin } from "@/lib/auth";
import { STATUSES } from "./format";
import { sendSms } from "@/lib/sms";
import { sendEmail, escapeHtml } from "@/lib/email";
import { site } from "@/lib/site";

// ---------- auth ----------
export async function login(_: { error?: string } | undefined, form: FormData) {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Wrong password. Check caps lock and try again." };
  }
  await createSession();
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

// ---------- enquiries ----------
export type EnquiryFormState = { ok?: boolean; error?: string; savedAt?: number } | undefined;

export async function updateEnquiry(id: string, _: EnquiryFormState, form: FormData): Promise<EnquiryFormState> {
  await requireAdmin();
  const status = String(form.get("status") ?? "");
  const notes = String(form.get("notes") ?? "").slice(0, 5000);
  if (!STATUSES.some((s) => s.value === status)) return { error: "Choose a status" };
  await db.enquiry.update({ where: { id }, data: { status: status as EnquiryStatus, notes: notes || null } });
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
  return { ok: true, savedAt: Date.now() };
}

// ---------- reply to a customer ----------
export type ReplyState = { ok?: boolean; error?: string; result?: string; sentAt?: number } | undefined;

/**
 * Sends Faith's reply to the customer by SMS (Africa's Talking) and/or email, from inside the admin.
 * Every reply is logged at the top of the private notes, and a NEW enquiry moves to "In progress".
 */
export async function replyToEnquiry(id: string, _: ReplyState, form: FormData): Promise<ReplyState> {
  await requireAdmin();
  const message = String(form.get("message") ?? "").trim().slice(0, 2000);
  const bySms = form.get("sms") === "on";
  const byEmail = form.get("email") === "on";
  if (!message) return { error: "Write a message first." };
  if (!bySms && !byEmail) return { error: "Choose SMS, email or both." };

  const e = await db.enquiry.findUnique({ where: { id } });
  if (!e) return { error: "This enquiry no longer exists." };

  const outcome: string[] = [];
  const sentVia: string[] = [];

  if (bySms) {
    const r = await sendSms(e.phone, message);
    if (r.sent) { outcome.push("SMS sent"); sentVia.push("SMS"); }
    else if (r.info.startsWith("demo")) outcome.push("SMS not sent: Africa's Talking keys aren't set (demo mode)");
    else if (r.info.startsWith("international")) outcome.push("SMS not sent: SMS only goes to Kenyan numbers");
    else outcome.push(`SMS failed (${r.info})`);
  }

  if (byEmail) {
    const subject = String(form.get("subject") ?? "").trim().slice(0, 150) || `Re: your request ${e.reference}`;
    const html = `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>Faith<br>${escapeHtml(site.name)}</p>`;
    const r = await sendEmail(e.email, subject, `Your request ${e.reference}`, html);
    if (r.sent) { outcome.push("Email sent"); sentVia.push("email"); }
    else if (!process.env.SMTP_HOST) outcome.push("Email not sent: email settings aren't set (demo mode)");
    else outcome.push("Email failed. Check the email settings and try again.");
  }

  if (sentVia.length) {
    const stamp = new Date().toLocaleString("en-GB", { timeZone: "Africa/Nairobi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const log = `[${stamp}] Replied by ${sentVia.join(" + ")}: "${message}"`;
    await db.enquiry.update({
      where: { id },
      data: {
        notes: (log + (e.notes ? `\n\n${e.notes}` : "")).slice(0, 5000),
        ...(e.status === "NEW" ? { status: "IN_PROGRESS" as EnquiryStatus } : {}),
      },
    });
    revalidatePath(`/admin/enquiries/${id}`);
    revalidatePath("/admin");
  }

  return { ok: sentVia.length > 0, result: outcome.join(" · "), sentAt: Date.now() };
}

// ---------- trips ----------
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

// "" must be an error, not 0 (z.coerce turns "" into 0 and the trip would show as free)
const required = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const money = z.preprocess(required, z.coerce.number({ message: "Enter an amount" }).int("Whole numbers only").min(1, "Enter an amount above 0"));
const TripSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required"),
    slug: z.string().trim(),
    destination: z.string().trim().min(2, "Destination is required"),
    startDate: z.preprocess(required, z.coerce.date({ message: "Choose a start date" })),
    endDate: z.preprocess(required, z.coerce.date({ message: "Choose an end date" })),
    summary: z.string().trim().min(10, "Write a short summary"),
    highlights: z.string(),
    includes: z.string(),
    imageUrl: z.union([z.literal(""), z.url("Must be a full https:// link")]),
    priceKes: money,
    priceUsd: money,
    depositKes: money,
    depositUsd: money,
    totalSpots: z.preprocess(required, z.coerce.number({ message: "Enter the number of spots" }).int("Whole numbers only").min(1, "At least 1 spot")),
    published: z.boolean(),
  })
  .refine((t) => t.endDate >= t.startDate, { path: ["endDate"], message: "End date is before the start date" })
  .refine((t) => t.depositKes <= t.priceKes, { path: ["depositKes"], message: "Deposit is more than the price" })
  .refine((t) => t.depositUsd <= t.priceUsd, { path: ["depositUsd"], message: "Deposit is more than the price" });

export type TripFormState = {
  errors?: Record<string, string>;
  message?: string;
  /** what was typed, sent back so a failed save never wipes the form */
  values?: Record<string, string>;
} | undefined;

export async function saveTrip(id: string | null, _: TripFormState, form: FormData): Promise<TripFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
  const parsed = TripSchema.safeParse({ ...raw, published: form.get("published") === "on" });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    const n = Object.keys(errors).length;
    return { errors, values, message: `Fix ${n} highlighted field${n === 1 ? "" : "s"} and save again. Nothing you typed was lost.` };
  }
  const t = parsed.data;
  const slug = slugify(t.slug || t.title);
  const clash = await db.trip.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { errors: { slug: "Another trip already uses this web address. Change it slightly." }, values, message: "Fix the highlighted field and save again." };

  const data = {
    title: t.title, slug, destination: t.destination, startDate: t.startDate, endDate: t.endDate,
    summary: t.summary, highlights: lines(t.highlights), includes: lines(t.includes),
    imageUrl: t.imageUrl || null, priceKes: t.priceKes, priceUsd: t.priceUsd,
    depositKes: t.depositKes, depositUsd: t.depositUsd, totalSpots: t.totalSpots, published: t.published,
  };
  const trip = id ? await db.trip.update({ where: { id }, data }) : await db.trip.create({ data });
  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  revalidatePath("/");
  redirect(`/admin/trips/${trip.id}?saved=1`);
}

export async function togglePublished(id: string) {
  await requireAdmin();
  const trip = await db.trip.findUniqueOrThrow({ where: { id } });
  await db.trip.update({ where: { id }, data: { published: !trip.published } });
  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  revalidatePath("/");
}

export async function deleteTrip(id: string) {
  await requireAdmin();
  const bookings = await db.enquiry.count({ where: { tripId: id } });
  if (bookings > 0) {
    // keep the history; just hide it from the site
    await db.trip.update({ where: { id }, data: { published: false } });
  } else {
    await db.trip.delete({ where: { id } });
  }
  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  redirect("/admin/trips");
}
