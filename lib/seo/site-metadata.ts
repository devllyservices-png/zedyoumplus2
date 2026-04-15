import type { Metadata } from "next"
import { getTranslations } from "@/lib/i18n"

const fr = getTranslations("fr")
const ar = getTranslations("ar")

export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw)
}

const brandFr = fr.categoryPage.brandName
const brandAr = ar.categoryPage.brandName

const keywords = [
  brandFr,
  brandAr,
  "freelance",
  "services numériques",
  "ZedYoum",
  "خدمات رقمية",
  "مستقلين",
  "منتجات رقمية",
].join(", ")

export const siteMetadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: brandFr,
    template: `%s | ${brandFr}`,
  },
  description: fr.hero.subtitle,
  keywords,
  applicationName: brandFr,
  icons: {
    icon: [{ url: "/images/logo-small.png", type: "image/png", sizes: "any" }],
    apple: [{ url: "/images/logo-small.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["ar", "en_US"],
    siteName: brandFr,
    title: fr.hero.title,
    description: fr.hero.subtitle,
  },
  twitter: {
    card: "summary_large_image",
    title: fr.hero.title,
    description: fr.hero.subtitle,
  },
  robots: {
    index: true,
    follow: true,
  },
}
