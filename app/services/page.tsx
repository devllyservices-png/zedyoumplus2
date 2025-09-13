"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import EnhancedServicesGrid from "@/components/enhanced-services-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const categories = [
  { value: "all", label: "جميع الفئات" },
  { value: "web-development", label: "تطوير المواقع" },
  { value: "mobile-development", label: "تطوير التطبيقات" },
  { value: "design", label: "التصميم" },
  { value: "marketing", label: "التسويق" },
  { value: "writing", label: "الكتابة" },
  { value: "translation", label: "الترجمة" },
  { value: "video", label: "الفيديو" },
  { value: "audio", label: "الصوت" },
  { value: "business", label: "الأعمال" },
  { value: "lifestyle", label: "نمط الحياة" },
  { value: "other", label: "أخرى" }
]

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "price-low", label: "السعر: من الأقل للأعلى" },
  { value: "price-high", label: "السعر: من الأعلى للأقل" },
  { value: "orders", label: "الأكثر طلباً" }
]

export default function ServicesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("newest")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">استكشف الخدمات</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            اكتشف آلاف الخدمات المهنية من أفضل المقدمين حول العالم
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 sm:mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ابحث عن الخدمات..."
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
                    <SelectValue placeholder="اختر الفئة" />
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
                    <SelectValue placeholder="ترتيب حسب" />
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