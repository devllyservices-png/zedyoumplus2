"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import EnhancedServicesGrid from "@/components/enhanced-services-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function ServicesPage() {
  const { t } = useTranslation()
  
  const categories = [
    { value: "all", label: t.servicesPage.categories.all },
    { value: "design", label: t.servicesPage.categories.design },
    { value: "programming", label: t.servicesPage.categories.programming },
    { value: "translation", label: t.servicesPage.categories.translation },
    { value: "marketing", label: t.servicesPage.categories.marketing },
    { value: "education", label: t.servicesPage.categories.education },
    { value: "audio", label: t.servicesPage.categories.audio },
    { value: "photography", label: t.servicesPage.categories.photography },
    { value: "illustration", label: t.servicesPage.categories.illustration },
    { value: "mobile", label: t.servicesPage.categories.mobile },
    { value: "seo", label: t.servicesPage.categories.seo },
    { value: "content", label: t.servicesPage.categories.content },
    { value: "video", label: t.servicesPage.categories.video }
  ]

  const sortOptions = [
    { value: "newest", label: t.servicesPage.sortOptions.newest },
    { value: "oldest", label: t.servicesPage.sortOptions.oldest },
    { value: "rating", label: t.servicesPage.sortOptions.rating },
    { value: "price-low", label: t.servicesPage.sortOptions.priceLow },
    { value: "price-high", label: t.servicesPage.sortOptions.priceHigh },
    { value: "orders", label: t.servicesPage.sortOptions.orders }
  ]
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("newest")

  // Initialize state from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search')
    const categoryParam = searchParams.get('category')
    
    if (searchParam) {
      setSearch(searchParam)
    }
    
    if (categoryParam) {
      setCategory(categoryParam)
    }
  }, [searchParams])

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

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t.servicesPage.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 h-12"
              />
            </div>

            {/* Category and Sort Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <div className="flex-1">
                <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? undefined : value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t.servicesPage.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t.servicesPage.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <EnhancedServicesGrid 
          category={category || undefined}
          search={search || undefined}
          sortBy={sortBy}
          limit={24}
        />
      </div>

      <Footer />
    </div>
  )
}