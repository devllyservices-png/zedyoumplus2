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
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-32" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
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
    <div className="space-y-8">
      {/* Seller Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-white">
              <AvatarImage 
                src={seller.profile.avatar_url || "/images/avatar-fallback.svg"} 
                alt={seller.profile.display_name} 
              />
              <AvatarFallback className="text-2xl">
                {seller.profile.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {seller.profile.display_name}
                </h1>
                {seller.profile.is_verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موثق
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{seller.stats.average_rating.toFixed(1)}</span>
                  <span>({seller.stats.total_reviews} تقييم)</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{seller.stats.total_orders} طلب مكتمل</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>عضو منذ {new Date(seller.profile.member_since).getFullYear()}</span>
                </div>
              </div>

              {seller.profile.bio && (
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {seller.profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {seller.profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{seller.profile.location}</span>
                  </div>
                )}
                {seller.profile.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{seller.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>وقت الاستجابة: {seller.stats.response_time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>معدل الدعم: {seller.stats.support_rate}</span>
                </div>
              </div>

              {seller.profile.languages && seller.profile.languages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">اللغات:</p>
                  <div className="flex flex-wrap gap-2">
                    {seller.profile.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {seller.stats.total_services}
            </div>
            <div className="text-sm text-gray-600">الخدمات</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {seller.stats.total_orders}
            </div>
            <div className="text-sm text-gray-600">الطلبات المكتملة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {seller.stats.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">التقييم المتوسط</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {seller.stats.total_reviews}
            </div>
            <div className="text-sm text-gray-600">التقييمات</div>
          </CardContent>
        </Card>
      </div>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>خدمات {seller.profile.display_name}</span>
            <Badge variant="outline">
              {seller.stats.total_services} خدمة
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seller.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seller.services.map((service) => (
                <Card key={service.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-video relative overflow-hidden">
                    {service.primary_image ? (
                      <Image
                        src={service.primary_image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {service.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="px-4 pb-4 pt-0">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        <span>{service.total_orders}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-lg font-bold text-gray-900">
                          {service.service_packages?.[0]?.price ? 
                            `$${service.service_packages[0].price}` : 
                            'السعر عند الطلب'
                          }
                        </p>
                        {service.service_packages?.[0]?.delivery_time && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{service.service_packages[0].delivery_time}</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/services/${service.id}`}>
                        <Button size="sm" variant="outline">
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
              <p className="text-gray-600">لم يقم هذا البائع بإنشاء أي خدمات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
