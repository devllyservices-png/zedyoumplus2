"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Star, 
  ShoppingCart, 
  Clock, 
  MessageCircle, 
  CheckCircle,
  MapPin,
  Phone,
  Calendar,
  Star as StarIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ServicesGrid from "./services-grid"

interface SellerProfile {
  id: string
  email: string
  role: string
  created_at: string
  profile: {
    display_name: string
    bio: string
    avatar_url: string
    location: string
    phone: string
    is_verified: boolean
    rating: number
    completed_orders: number
    member_since: string
    response_time: string
    support_rate: string
    languages: string[]
  }
  services: Array<{
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    rating: number
    total_orders: number
    primary_image: string | null
    service_packages: Array<{
      name: string
      price: number
      delivery_time: string
    }>
    created_at: string
  }>
  stats: {
    total_services: number
    total_orders: number
    average_rating: number
    total_reviews: number
    response_time: string
    support_rate: string
  }
}

interface SellerProfileProps {
  sellerId: string
}

export default function SellerProfile({ sellerId }: SellerProfileProps) {
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSellerProfile()
  }, [sellerId])

  const fetchSellerProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sellers/${sellerId}/profile`)
      const data = await response.json()

      if (response.ok) {
        setSeller(data.seller)
      } else {
        setError(data.error || 'فشل في جلب بيانات البائع')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        {/* Header skeleton */}
        <div className="bg-white rounded-xl shadow-lg border p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 w-full text-center sm:text-right">
              <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mb-2 w-48 mx-auto sm:mx-0" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-32 mx-auto sm:mx-0" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!seller) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">البائع غير موجود</h3>
        <p className="text-gray-600">لا يمكن العثور على البائع المطلوب</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Seller Header */}
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-white shadow-lg">
              <AvatarImage 
                src={seller.profile.avatar_url || "/images/avatar-fallback.svg"} 
                alt={seller.profile.display_name} 
                className="object-cover"
              />
              <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {seller.profile.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-right w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {seller.profile.display_name}
                </h1>
                {seller.profile.is_verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موثق
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 mb-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{seller.stats.average_rating.toFixed(1)}</span>
                  <span className="text-sm">({seller.stats.total_reviews} تقييم)</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{seller.stats.total_orders} طلب مكتمل</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm sm:text-base">عضو منذ {new Date(seller.profile.member_since).getFullYear()}</span>
                </div>
              </div>

              {seller.profile.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed text-center sm:text-right max-w-2xl mx-auto sm:mx-0">
                  {seller.profile.bio}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                {seller.profile.location && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{seller.profile.location}</span>
                  </div>
                )}
                {seller.profile.phone && (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span>{seller.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>وقت الاستجابة: {seller.stats.response_time}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span>معدل الدعم: {seller.stats.support_rate}</span>
                </div>
              </div>

              {seller.profile.languages && seller.profile.languages.length > 0 && (
                <div className="mt-4 text-center sm:text-right">
                  <p className="text-sm font-medium text-gray-700 mb-2">اللغات:</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {seller.profile.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="bg-white/80">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              {seller.stats.total_services}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">الخدمات</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              {seller.stats.total_orders}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">الطلبات المكتملة</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
              {seller.stats.average_rating.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">التقييم المتوسط</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
              {seller.stats.total_reviews}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">التقييمات</div>
          </CardContent>
        </Card>
      </div>

      {/* Services Section */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl">خدمات {seller.profile.display_name}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {seller.stats.total_services} خدمة
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seller.services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {seller.services.map((service) => (
                <Card key={service.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <div className="aspect-video relative overflow-hidden">
                    {service.primary_image ? (
                      <Image
                        src={service.primary_image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/95 text-gray-700 backdrop-blur-sm">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-right">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        <span>{service.total_orders}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {service.service_packages?.[0]?.price ? 
                            `$${service.service_packages[0].price}` : 
                            'السعر عند الطلب'
                          }
                        </p>
                        {service.service_packages?.[0]?.delivery_time && (
                          <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{service.service_packages[0].delivery_time}</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/services/${service.id}`} className="w-full">
                        <Button size="sm" variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300">
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
              <p className="text-gray-600 max-w-md mx-auto">لم يقم هذا البائع بإنشاء أي خدمات بعد. تحقق مرة أخرى لاحقاً!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
