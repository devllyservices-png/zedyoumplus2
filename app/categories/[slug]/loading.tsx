"use client"

import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function CategoryBrowseLoading() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-700">{t.categoryPage.loading}</p>
      </div>
    </div>
  )
}
