"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Star, Clock, Shield, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface ServiceWithSeller {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  average_rating: number
  reviews_count: number
  total_orders: number
  primary_image?: string
  service_packages?: Array<{
    id: string
    name: string
    price: number
    delivery_time?: string
  }>
  seller_id: string
  seller_profile?: {
    display_name: string
    avatar_url?: string
    is_verified: boolean
    rating: number
    completed_orders: number
    response_time?: string
  }
}

export function ServicesCarousel() {
  const [services, setServices] = useState<ServiceWithSeller[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const loadServices = async () => {
      setError("")
      setIsLoading(true)
      try {
        const response = await fetch("/api/services?limit=12")
        const data = await response.json()

        if (response.ok) {
          setServices(data.services || [])
        } else {
          throw new Error(data.error || "فشل في تحميل الخدمات")
        }
      } catch (e: any) {
        setError(e?.message || "تعذر تحميل الخدمات")
      } finally {
        setIsLoading(false)
      }
    }

    loadServices()
  }, [])

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= services.length ? 0 : prev + itemsPerView
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - itemsPerView < 0 ? Math.max(0, services.length - itemsPerView) : prev - itemsPerView
    )
  }

  const visibleServices = services.slice(currentIndex, currentIndex + itemsPerView)

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              الخدمات الأكثر طلبًا
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              اكتشف أفضل الخدمات المقدمة من المستقلين الجزائريين المحترفين
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              الخدمات الأكثر طلبًا
            </h2>
            <p className="text-gray-600 mb-6">لا توجد خدمات لعرضها حالياً.</p>
            <Link href="/services">
              <Button className="btn-gradient text-white px-6 py-2 rounded-lg">
                استعرض كل الخدمات
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            الخدمات الأكثر طلبًا
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف أفضل الخدمات المقدمة من المستقلين الجزائريين المحترفين
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Mobile Swipe Hint */}
          {services.length > itemsPerView && (
            <div className="text-center mb-4 sm:hidden">
              <p className="text-sm text-gray-500">اسحب للتنقل بين الخدمات</p>
            </div>
          )}
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
            {visibleServices.map((service, index) => {
              const firstPackage = service.service_packages?.[0]
              const price = firstPackage?.price || 0
              const delivery = firstPackage?.delivery_time || "غير محدد"
              const seller = service.seller_profile

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                >
                  <Link href={`/services/${service.id}`}>
                    <Card className="group border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden pt-0 cursor-pointer">
                    {/* Service Image */}
                    <div className="relative">
                      <Image
                        src={service.primary_image || "/placeholder.svg"}
                        alt={service.title}
                        width={300}
                        height={250}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{service.average_rating.toFixed(1)}</span>
                    </div>
                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      يبدأ من {price} دج
                    </div>
                  </div>

                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Service Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {service.title}
                    </h3>

                    {/* Service Tags */}
                    {service.tags && service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200">
                            {tag}
                          </Badge>
                        ))}
                        {service.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            +{service.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Seller Information */}
                    {seller ? (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={seller.avatar_url || "/images/avatar-fallback.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                            {seller.display_name?.charAt(0) || "ب"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{seller.display_name || "البائع"}</span>
                            {seller.is_verified && (
                              <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                            )}
                            {seller.is_verified && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 flex-shrink-0">
                                معتمد
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span>{seller.rating?.toFixed(1) || "0.0"}</span>
                            </div>
                            <span>•</span>
                            <span>{seller.completed_orders || 0} طلب</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm">
                            ب
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">البائع</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span>0.0</span>
                            </div>
                            <span>•</span>
                            <span>0 طلب</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(service.average_rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {service.average_rating.toFixed(1)} ({service.reviews_count} تقييم)
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{delivery}</span>
                    </div>
                  </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        {services.length > itemsPerView && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg border-gray-200 hover:border-blue-300 text-xs sm:text-sm"
              onClick={prevSlide}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">السابق</span>
              <span className="sm:hidden">‹</span>
            </Button>

            {/* Carousel Indicators */}
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(services.length / itemsPerView) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                    Math.floor(currentIndex / itemsPerView) === index
                      ? "bg-blue-600 scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentIndex(index * itemsPerView)}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg border-gray-200 hover:border-blue-300 text-xs sm:text-sm"
              onClick={nextSlide}
            >
              <span className="hidden sm:inline">التالي</span>
              <span className="sm:hidden">›</span>
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/services">
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent backdrop-blur-sm"
            >
              عرض المزيد من الخدمات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
