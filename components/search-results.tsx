'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, User, Eye } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Service {
  id: number
  title_ar?: string
  title_en?: string
  title?: string
  description_ar?: string
  description_en?: string
  description?: string
  price: number
  rating: number
  total_reviews: number
  total_orders: number
  delivery_time: number
  category: string
  service_images?: Array<{
    image_url: string
    is_primary: boolean
  }>
  service_packages?: Array<{
    name: string
    price: number
    delivery_time: number
  }>
}

interface SearchResultsProps {
  query: string
  isVisible: boolean
  onClose: () => void
}

export function SearchResults({ query, isVisible, onClose }: SearchResultsProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim() || !isVisible) {
      setServices([])
      return
    }

    const searchServices = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/services?search=${encodeURIComponent(query)}&limit=6`)
        const data = await response.json()
        
        if (response.ok) {
          console.log('Search results data:', data.services)
          setServices(data.services || [])
        } else {
          setError(data.error || 'حدث خطأ في البحث')
        }
      } catch (err) {
        setError('حدث خطأ في الاتصال')
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchServices, 300)
    return () => clearTimeout(timeoutId)
  }, [query, isVisible])

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'design': 'التصميم',
      'programming': 'البرمجة',
      'translation': 'الترجمة',
      'marketing': 'التسويق',
      'education': 'التعليم',
      'audio': 'الصوتيات',
      'photography': 'التصوير',
      'illustration': 'الرسم',
      'mobile': 'تطبيقات الجوال',
      'seo': 'تحسين محركات البحث',
      'content': 'كتابة المحتوى',
      'video': 'المونتاج والفيديو'
    }
    return categoryMap[category] || category
  }

  const getServiceImage = (service: Service) => {
    if (service.service_images && service.service_images.length > 0) {
      const primaryImage = service.service_images.find(img => img.is_primary)
      return primaryImage?.image_url || service.service_images[0].image_url
    }
    return '/images/placeholder-service.jpg'
  }

  if (!isVisible || !query.trim()) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 z-50 mt-2"
      >
        <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                نتائج البحث عن "{query}"
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-3 text-gray-600">جاري البحث...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>لم يتم العثور على خدمات تطابق بحثك</p>
                <p className="text-sm mt-1">جرب كلمات مختلفة أو تصفح الفئات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => {
                  console.log('Individual service data:', service)
                  return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/services/${service.id}`}>
                      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-0 bg-white/50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Service Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={getServiceImage(service)}
                                alt={service.title_ar || service.title_en || service.title || 'خدمة'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder-service.jpg'
                                }}
                              />
                            </div>

                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                                    {service.title_ar || service.title_en || service.title || 'عنوان غير محدد'}
                                  </h4>
                                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                                    {service.description_ar || service.description_en || service.description || 'وصف غير محدد'}
                                  </p>
                                </div>
                                <div className="text-left ml-2">
                                  <p className="font-bold text-blue-600 text-sm">
                                    {service.price ? `${service.price} دج` : 'السعر غير محدد'}
                                  </p>
                                </div>
                              </div>

                              {/* Service Meta */}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{service.rating.toFixed(1)}</span>
                                  <span>({service.total_reviews})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{service.delivery_time} يوم</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{service.total_orders} طلب</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {getCategoryName(service.category)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                  )
                })}

                {/* View All Results */}
                {services.length >= 6 && (
                  <div className="pt-3 border-t border-gray-200">
                    <Link href={`/services?search=${encodeURIComponent(query)}`}>
                      <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        عرض جميع النتائج ({services.length}+)
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
