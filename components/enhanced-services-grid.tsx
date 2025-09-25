"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, ShoppingCart, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
    bio?: string
  }
  created_at: string
}

interface EnhancedServicesGridProps {
  category?: string
  search?: string
  limit?: number
  sortBy?: string
}

export default function EnhancedServicesGrid({ 
  category, 
  search, 
  limit = 24, 
  sortBy = "newest"
}: EnhancedServicesGridProps) {
  const [services, setServices] = useState<ServiceWithSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalServices, setTotalServices] = useState(0)

  useEffect(() => {
    fetchServices()
  }, [category, search, sortBy, currentPage, limit])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError("")
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })
      
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      if (sortBy) params.append('sort', sortBy)

      const response = await fetch(`/api/services?${params}`)
      const data = await response.json()

      if (response.ok) {
        setServices(data.services || [])
        setTotalServices(data.pagination?.total || 0)
        setTotalPages(Math.ceil((data.pagination?.total || 0) / limit))
      } else {
        throw new Error(data.error || "فشل في تحميل الخدمات")
      }
    } catch (e: any) {
      setError(e?.message || "تعذر تحميل الخدمات")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton Loader */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, idx) => (
            <Card key={idx} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm pt-0 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-xl" />
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={fetchServices} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-6">لا توجد خدمات مطابقة لبحثك.</p>
        <Button onClick={() => { setCurrentPage(1); fetchServices() }} variant="outline">
          عرض جميع الخدمات
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          عرض {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalServices)} من {totalServices} خدمة
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.map((service) => {
          const firstPackage = service.service_packages?.[0]
          const price = firstPackage?.price || 0
          const delivery = firstPackage?.delivery_time || "غير محدد"
          const seller = service.seller_profile

          return (
            <Card key={service.id} className="group border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ease-in-out overflow-hidden pt-0 animate-in fade-in-0 slide-in-from-bottom-4">
              {/* Service Image */}
              <div className="relative">
                <Image
                  src={service.primary_image || "/placeholder.svg"}
                  alt={service.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{delivery}</span>
                </div>

                {/* Price and Order Button */}
                <div className="flex items-center justify-between">
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${price} دج
                  </div>
                  <Link href={`/services/${service.id}`}>
                    <Button className="btn-gradient text-white px-4 py-2 text-sm rounded-lg flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      طلب الآن
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg border-gray-200 hover:border-blue-300"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            السابق
          </Button>

          {/* Page Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  className={`w-8 h-8 rounded-full transition-all duration-300 text-sm font-medium cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white scale-110"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg border-gray-200 hover:border-blue-300"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            التالي
            <ChevronLeft className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
