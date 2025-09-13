"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Star, 
  ShoppingCart, 
  Clock, 
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
  Image as ImageIcon,
  Package,
  HelpCircle,
  User,
  Shield
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

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
  service_images: Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>
  service_packages: Array<{
    id: string
    name: string
    price: number
    delivery_time: string
    revisions: string
    features: string[]
  }>
  service_faq: Array<{
    id: string
    question: string
    answer: string
  }>
  service_reviews: Array<{
    id: string
    rating: number
    comment: string
    created_at: string
    user_id: string
    users: {
      display_name: string
      avatar_url: string
    }
  }>
  created_at: string
  seller_id: string
}

interface SellerProfile {
  id: string
  display_name: string
  bio: string
  avatar_url: string
  location: string
  phone: string
  is_verified: boolean
  rating: number
  completed_orders: number
  response_time: string
  support_rate: string
  languages: string[]
  member_since: string
}

interface ServiceDetailProps {
  serviceId: string
}

export default function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const { user, hasPermission } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<number>(0)
  const [showAllImages, setShowAllImages] = useState(false)

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/services/${serviceId}`)
      const data = await response.json()

      if (response.ok) {
        setService(data.service)
        // Fetch seller profile if we have seller_id
        if (data.service?.seller_id) {
          fetchSellerProfile(data.service.seller_id)
        }
      } else {
        setError(data.error || 'فشل في جلب تفاصيل الخدمة')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const fetchSellerProfile = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/sellers/${sellerId}/profile`)
      const data = await response.json()

      if (response.ok) {
        // The API returns data.seller, not data.profile
        const sellerData = data.seller
        if (sellerData && sellerData.profile) {
          setSellerProfile(sellerData.profile)
        }
      }
    } catch (err) {
      console.error('Error fetching seller profile:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
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

  if (!service) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">الخدمة غير موجودة</h3>
        <p className="text-gray-600">لا يمكن العثور على الخدمة المطلوبة</p>
      </div>
    )
  }

  const images = service.service_images || []
  const displayImages = showAllImages ? images : images.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Service Images */}
            <Card className="overflow-hidden border-0 shadow-xl pt-0 bg-white/80 backdrop-blur-sm">
              <div className="relative">
                {service.primary_image ? (
                  <Image
                    src={service.primary_image}
                    alt={service.title}
                    width={600}
                    height={400}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white backdrop-blur-sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    {service.total_orders} طلب
                  </Badge>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {displayImages.map((image, index) => (
                      <Image
                        key={image.id}
                        src={image.image_url}
                        alt={`${service.title} - ${index + 1}`}
                        width={100}
                        height={80}
                        className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all hover:scale-105 border-2 border-transparent hover:border-blue-300 flex-shrink-0"
                      />
                    ))}
                    {images.length > 4 && !showAllImages && (
                      <div 
                        className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
                        onClick={() => setShowAllImages(true)}
                      >
                        <span className="text-xs font-medium text-gray-600">
                          +{images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Service Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                    {service.category}
                  </Badge>
                  {service.tags && service.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {service.title}
                </h1>

                <div className="flex items-center gap-4 sm:gap-6 mb-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.average_rating.toFixed(1)}</span>
                    <span className="text-gray-600">({service.reviews_count} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>{service.total_orders} طلب مكتمل</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6">{service.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="packages" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="packages">الحزم</TabsTrigger>
                <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="packages" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-6">
                      {service.service_packages?.map((pkg, index) => (
                        <div key={pkg.id} className="border rounded-lg p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">{pkg.name}</h3>
                            <span className="text-2xl font-bold text-blue-600">
                              ${pkg.price}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {pkg.delivery_time && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>وقت التسليم: {pkg.delivery_time}</span>
                              </div>
                            )}
                            {pkg.revisions && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-gray-400" />
                                <span>المراجعات: {pkg.revisions}</span>
                              </div>
                            )}
                          </div>

                          {pkg.features && pkg.features.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">المميزات:</h4>
                              <ul className="space-y-1">
                                {pkg.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    {service.service_faq && service.service_faq.length > 0 ? (
                      <div className="space-y-4">
                        {service.service_faq.map((faq) => (
                          <div key={faq.id} className="border-b pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {faq.question}
                            </h4>
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد أسئلة شائعة متاحة</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    {service.service_reviews && service.service_reviews.length > 0 ? (
                      <div className="space-y-6">
                        {service.service_reviews.map((review) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={review.users?.avatar_url || "/images/avatar-fallback.svg"} />
                                <AvatarFallback>
                                  {review.users?.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{review.users?.display_name || 'مستخدم'}</span>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 mb-2">{review.comment}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد تقييمات متاحة</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info - Moved Higher and Simplified */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                    <AvatarImage src={sellerProfile?.avatar_url || "/images/avatar-fallback.svg"} />
                    <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {sellerProfile?.display_name?.charAt(0) || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold">{sellerProfile?.display_name || "البائع"}</h3>
                      {sellerProfile?.is_verified && <Shield className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="text-gray-600 text-sm">{sellerProfile?.location || "الموقع غير محدد"}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عضو منذ:</span>
                    <span className="font-medium">{sellerProfile?.member_since ? new Date(sellerProfile.member_since).getFullYear() : "2024"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت الاستجابة:</span>
                    <span className="font-medium">{sellerProfile?.response_time || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الدعم:</span>
                    <span className="font-medium">{sellerProfile?.support_rate || "غير محدد"}</span>
                  </div>
                </div>

                <Link href={`/sellers/${service.seller_id}/profile`}>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    عرض الملف الشخصي
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card className="border-0 shadow-xl pt-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  اطلب الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                {/* Package Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium block">اختر الحزمة</label>
                  <div className="space-y-3">
                    {service.service_packages?.map((pkg, index) => (
                      <div
                        key={pkg.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedPackage === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPackage(index)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm sm:text-base">{pkg.name}</h4>
                          <span className="text-base sm:text-lg font-bold text-blue-600">
                            ${pkg.price}
                          </span>
                        </div>
                        {pkg.delivery_time && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{pkg.delivery_time}</span>
                          </div>
                        )}
                        {pkg.revisions && (
                          <p className="text-xs text-gray-600">
                            المراجعات: {pkg.revisions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full btn-gradient text-white" size="lg">
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  طلب الخدمة
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
