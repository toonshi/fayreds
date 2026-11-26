// OWNER: Faith. /sitemap.xml for Google: public pages + every published trip.
import type { MetadataRoute } from "next";
import { getPublishedTrips } from "@/lib/trips";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/guides", "/trips", "/consultation", "/marketing", "/partnership"].map((p) => ({
    url: siteUrl(p),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const trips = await getPublishedTrips().catch(() => []);
  return [
    ...pages,
    ...trips.map((t) => ({ url: siteUrl(`/trips/${t.slug}`), lastModified: t.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
