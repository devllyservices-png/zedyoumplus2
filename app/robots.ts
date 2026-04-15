import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/seo/site-metadata"

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl().origin
  const host = getSiteUrl().host

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host,
  }
}
