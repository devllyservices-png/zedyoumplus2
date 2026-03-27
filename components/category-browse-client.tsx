"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { getCategoryIcon } from "@/lib/category-display"
import {
  pickCategoryLocale,
  type CategoryLocaleFields,
} from "@/lib/category-localized"
import ServicesListing from "@/components/services-listing"

export type CategoryBrowsePayload = CategoryLocaleFields & {
  slug: string
  icon_key: string
  gradient: string
  service_count: number
}

export function CategoryBrowseClient({
  category,
}: {
  category: CategoryBrowsePayload
}) {
  const { t, language } = useTranslation()
  const Icon = getCategoryIcon(category.icon_key)
  const { title: heroTitle, description: heroDescription } =
    pickCategoryLocale(category, language)

  const countLabel = t.categoryPage.serviceCount.replace(
    "{count}",
    String(category.service_count)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition-colors hover:text-blue-900"
        >
          <ChevronRight className="h-4 w-4" />
          {t.categoryPage.backToHome}
        </Link>

        <section className="relative mb-8 overflow-hidden rounded-3xl shadow-xl">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22),transparent_55%)]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/10" aria-hidden />

          <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-12">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/20 shadow-inner ring-2 ring-white/30 backdrop-blur-sm md:h-28 md:w-28"
              aria-hidden
            >
              <Icon className="h-12 w-12 text-white drop-shadow-md md:h-14 md:w-14" />
            </div>

            <div className="min-w-0 flex-1 text-white">
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/80">
                {countLabel}
              </p>
              <h1 className="text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/95 sm:text-lg">
                {heroDescription?.trim() || t.categoryPage.fallbackDescription}
              </p>
            </div>
          </div>
        </section>

        <ServicesListing
          category={category.slug}
          limit={24}
          showCategoryFilter={false}
          showSearch={true}
          showSort={true}
          showSeller={true}
        />
      </div>

      <Footer />
    </div>
  )
}
