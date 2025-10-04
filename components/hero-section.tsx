"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { SearchResults } from "@/components/search-results"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Categories data
  const categories = [
    { id: "design", name: "التصميم", searchTerm: "تصميم" },
    { id: "programming", name: "البرمجة", searchTerm: "برمجة" },
    { id: "translation", name: "الترجمة", searchTerm: "ترجمة" },
    { id: "marketing", name: "التسويق", searchTerm: "تسويق" },
    { id: "writing", name: "الكتابة", searchTerm: "كتابة" }
  ]

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.trim().length > 0)
  }

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchResults(false)
    }
  }

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/services?category=${categoryId}`)
  }

  // Handle search term click
  const handleSearchTermClick = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setShowSearchResults(true)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/vid/hero section.webm" type="video/webm" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Glassmorphism Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 lg:p-10 shadow-2xl"
        >
          {/* Main Content */}
          <div className="text-center space-y-6">
            {/* Headlines */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-3xl lg:text-5xl font-bold text-white leading-tight"
              >
                ابحث عن أفضل المستقلين في الجزائر أو قدّم خدماتك بسهولة
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto"
              >
                منصتك الشاملة لطلب الخدمات الرقمية وشراء المنتجات المضمونة، بوسائل دفع جزائرية 100%
              </motion.p>
            </div>

            {/* Search Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative" ref={searchRef}>
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="ابحث عن الخدمات أو المنتجات..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsSearchFocused(true)}
                      className="bg-transparent border-0 text-white placeholder:text-white/70 focus:ring-0 focus:border-0 text-lg py-4 px-6"
                    />
                  </div>
                  <Button
                    onClick={handleSearchSubmit}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-700 border-0 rounded-none rounded-l-2xl px-8 py-4"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search Results Dropdown */}
                <SearchResults
                  query={searchQuery}
                  isVisible={showSearchResults && isSearchFocused}
                  onClose={() => setShowSearchResults(false)}
                />
              </div>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                    onClick={() => handleCategoryClick(category.id)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
            >
              <Link href="/services">
                <Button
                  size="lg"
                  className="bg-white/20 border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl min-w-[180px]"
                >
                  استعرض الخدمات
                </Button>
              </Link>
              <Link href="/services/create">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 border-2 border-white/30 text-white hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl min-w-[180px]"
                >
                  قدّم خدمتك
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements for Visual Interest */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-12 h-12 bg-blue-500/20 rounded-full backdrop-blur-sm animate-bounce"></div>
      <div className="absolute top-1/2 left-5 w-10 h-10 bg-purple-500/20 rounded-full backdrop-blur-sm animate-pulse delay-1000"></div>
    </section>
  )
}
