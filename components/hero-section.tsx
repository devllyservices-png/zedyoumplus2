"use client"

// import { useState } from "react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Search } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  // const [searchQuery, setSearchQuery] = useState("")
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
