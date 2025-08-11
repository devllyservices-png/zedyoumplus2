"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
import { Search } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  // const [selectedCategory, setSelectedCategory] = useState("")
  // const [priceRange, setPriceRange] = useState([0, 50000])

  return (
    <section className="gradient-brand py-20 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-600/20"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Headlines */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            ابحث عن أفضل المستقلين في الجزائر أو قدّم خدماتك بسهولة
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto">
            منصتك الشاملة لطلب الخدمات الرقمية وشراء المنتجات المضمونة، بوسائل دفع جزائرية 100%
          </p>

          {/* Enhanced Search Bar with Glass Effect */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-2xl max-w-4xl mx-auto border border-white/20">
            <div className="flex flex-col gap-6">
              {/* Search Input and Category */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="ابحث عن خدمة أو منتج…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 h-14 text-lg border-white/30 bg-white/90 backdrop-blur-sm focus:border-blue-500 rounded-xl"
                  />
                </div>
                {/* <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="lg:w-64 h-14 text-lg border-white/30 bg-white/90 backdrop-blur-sm rounded-xl">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">التصميم والجرافيك</SelectItem>
                    <SelectItem value="programming">البرمجة والتطوير</SelectItem>
                    <SelectItem value="marketing">التسويق الرقمي</SelectItem>
                    <SelectItem value="writing">الكتابة والترجمة</SelectItem>
                    <SelectItem value="video">المونتاج والفيديو</SelectItem>
                    <SelectItem value="education">التعليم والدروس</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>

            

              {/* Search Button */}
              <Button className="btn-gradient text-white px-12 h-14 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Search className="w-5 h-5 ml-2" />
                بحث متقدم
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-medium rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                استعرض الخدمات
              </Button>
            </Link>
            <Link href="/services/create">
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-medium rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                قدّم خدمتك
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
