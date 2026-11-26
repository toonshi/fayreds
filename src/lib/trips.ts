// OWNER: Hendy. Read helpers used by the public site (Faith) and the APIs (Mike).
import { db } from "./db";

/** Spots count as taken once the reservation is paid (or Faith moved it further along). */
const TAKEN = ["PAID", "IN_PROGRESS", "COMPLETED"] as const;

export async function getPublishedTrips() {
  return db.trip.findMany({
    where: { published: true, endDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
  });
}

export async function getTripBySlug(slug: string) {
  return db.trip.findFirst({ where: { slug, published: true } });
}

export async function spotsLeft(tripId: string) {
  const trip = await db.trip.findUnique({ where: { id: tripId }, select: { totalSpots: true } });
  if (!trip) return 0;
  const taken = await db.enquiry.aggregate({
    where: { tripId, type: "RESERVATION", status: { in: [...TAKEN] } },
    _sum: { spots: true },
  });
  return Math.max(0, trip.totalSpots - (taken._sum.spots ?? 0));
}
