// OWNER: Faith. /robots.txt: keep admin, API and payment pages out of search results.
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/pay/", "/thank-you"] },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
