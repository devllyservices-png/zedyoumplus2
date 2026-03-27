"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { getCategoryIcon } from "@/lib/category-display"
import {
  pickCategoryLocale,
  type CategoryLocaleFields,
} from "@/lib/category-localized"
import { Loader2 } from "lucide-react"

type PublicCategory = CategoryLocaleFields & {
  id: string
  slug: string
  icon_key: string
  gradient: string
}

export function CategoriesSection() {
  const { t, language } = useTranslation()
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok || cancelled) {
          if (!cancelled) setFetchError(true)
          return
        }
        if (!cancelled) {
          setCategories(data.categories ?? [])
          setFetchError(false)
        }
      } catch {
        if (!cancelled) setFetchError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto flex min-h-[200px] items-center justify-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        </div>
      </section>
    )
  }

  if (fetchError || categories.length === 0) {
    return (
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              {t.categories.title}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              {t.categories.subtitle}
            </p>
          </motion.div>
          <p className="text-gray-500">
            {fetchError ? t.categories.loadError : t.categories.empty}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            {t.categories.title}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t.categories.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-6">
          {categories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.icon_key)
            const { title: cardTitle } = pickCategoryLocale(category, language)
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
                >
                  <Card className="group h-full cursor-pointer border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-sm font-bold leading-tight text-gray-900 lg:text-base">
                        {cardTitle}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
