"use server";
// OWNER: Hendy. Every action re-checks the admin session.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EnquiryStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { checkPassword, createSession, deleteSession, requireAdmin } from "@/lib/auth";
import { STATUSES } from "./format";

// ---------- auth ----------
export async function login(_: { error?: string } | undefined, form: FormData) {
  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Wrong password" };
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
export async function updateEnquiry(id: string, form: FormData) {
  await requireAdmin();
  const status = String(form.get("status") ?? "");
  const notes = String(form.get("notes") ?? "").slice(0, 5000);
  if (!STATUSES.some((s) => s.value === status)) throw new Error("Bad status");
  await db.enquiry.update({ where: { id }, data: { status: status as EnquiryStatus, notes: notes || null } });
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
}

// ---------- trips ----------
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 60);

const money = z.coerce.number().int("Whole numbers only").min(0, "Can't be negative");
const TripSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required"),
    slug: z.string().trim(),
    destination: z.string().trim().min(2, "Destination is required"),
    startDate: z.coerce.date({ message: "Start date is required" }),
    endDate: z.coerce.date({ message: "End date is required" }),
    summary: z.string().trim().min(10, "Write a short summary"),
    highlights: z.string(),
    includes: z.string(),
    imageUrl: z.union([z.literal(""), z.url("Must be a full https:// link")]),
    priceKes: money,
    priceUsd: money,
    depositKes: money,
    depositUsd: money,
    totalSpots: z.coerce.number().int().min(1, "At least 1 spot"),
    published: z.boolean(),
  })
  .refine((t) => t.endDate >= t.startDate, { path: ["endDate"], message: "End date is before the start date" })
  .refine((t) => t.depositKes <= t.priceKes, { path: ["depositKes"], message: "Deposit is more than the price" })
  .refine((t) => t.depositUsd <= t.priceUsd, { path: ["depositUsd"], message: "Deposit is more than the price" });

export type TripFormState = { errors?: Record<string, string>; message?: string } | undefined;

export async function saveTrip(id: string | null, _: TripFormState, form: FormData): Promise<TripFormState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  const parsed = TripSchema.safeParse({ ...raw, published: form.get("published") === "on" });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, message: "Please fix the highlighted fields" };
  }
  const t = parsed.data;
  const slug = slugify(t.slug || t.title);
  const clash = await db.trip.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { errors: { slug: "Another trip already uses this link" } };

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
