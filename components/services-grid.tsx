"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Service {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  rating: number
  total_orders: number
  average_rating: number
  reviews_count: number
  primary_image: string | null
  service_packages: Array<{
    name: string
    price: number
    delivery_time: string
  }>
  created_at: string
}

interface ServicesGridProps {
  category?: string
  search?: string
  limit?: number
  showSeller?: boolean
}

export default function ServicesGrid({ 
  category, 
  search, 
  limit = 12, 
  showSeller = false 
}: ServicesGridProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        if (search) params.append('search', search)
        if (limit) params.append('limit', limit.toString())

        const response = await fetch(`/api/services?${params}`)
        const data = await response.json()

        if (response.ok) {
          setServices(data.services || [])
        } else {
          setError(data.error || 'فشل في جلب الخدمات')
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [category, search, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 animate-pulse" />
            <CardContent className="px-4 pb-4 pt-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
        <p className="text-gray-600 mb-4">
          {search ? 'لم نجد خدمات تطابق بحثك' : 'لا توجد خدمات متاحة حالياً'}
        </p>
        {!search && (
          <Link href="/services/create">
            <Button>إضافة خدمة جديدة</Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
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
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {service.description}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">
                  {service.average_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({service.reviews_count})
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <ShoppingCart className="w-4 h-4" />
                <span>{service.total_orders}</span>
              </div>
            </div>

            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {service.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{service.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

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
                  <Eye className="w-4 h-4 ml-1" />
                  عرض
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
