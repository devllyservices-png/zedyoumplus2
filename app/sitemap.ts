import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabaseClient"
import { getSiteUrl } from "@/lib/seo/site-metadata"

const staticPaths = [
  "/",
  "/home",
  "/services",
  "/digital-products",
  "/how-it-works",
  "/contact",
  "/terms",
  "/privacy",
  "/login",
  "/register",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl().origin
  const lastModified = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${origin}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: path === "/" || path === "/home" ? 1 : 0.8,
  }))

  const { data, error } = await supabase
    .from("service_categories")
    .select("slug")
    .eq("is_active", true)

  if (error || !data?.length) {
    return staticEntries
  }

  const categoryEntries: MetadataRoute.Sitemap = data.map((row) => ({
    url: `${origin}/categories/${row.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...categoryEntries]
}
