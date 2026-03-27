"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import ServicesListing from "@/components/services-listing"

function ServicesPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جاري تحميل الخدمات...</p>
      </div>
    </div>
  )
}

function ServicesContent() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{t.servicesPage.title}</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t.servicesPage.subtitle}
          </p>
        </div>

        <ServicesListing
          limit={24}
          showCategoryFilter={true}
          showSearch={true}
          showSort={true}
          showSeller={true}
        />
      </div>

      <Footer />
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesContent />
    </Suspense>
  )
}