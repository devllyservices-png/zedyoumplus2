"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  ShoppingCart, 
  Clock,
  Image as ImageIcon,
  Package,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
  created_at: string
}

export default function SellerServices() {
  const { user, hasPermission } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  useEffect(() => {
    if (user && hasPermission('service', 'read')) {
      fetchServices()
    }
  }, [user])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/services?seller_id=${user?.id}`)
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

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service)
    setShowDeleteDialog(true)
  }

  const deleteService = async () => {
    if (!serviceToDelete) return

    try {
      setDeletingId(serviceToDelete.id)
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setServices(services.filter(s => s.id !== serviceToDelete.id))
        setShowDeleteDialog(false)
        setServiceToDelete(null)
      } else {
        const data = await response.json()
        setError(data.error || 'فشل في حذف الخدمة')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setDeletingId(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog(false)
    setServiceToDelete(null)
  }

  if (!user) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          يجب تسجيل الدخول أولاً
        </AlertDescription>
      </Alert>
    )
  }

  if (user.role !== 'seller' && user.role !== 'admin') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          هذه الصفحة مخصصة للمقدمين فقط
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">خدماتي</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="px-4 pb-4 pt-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                </div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">خدماتي</h2>
        {hasPermission('service', 'create') && (
          <Link href="/services/create">
            <Button className="btn-gradient text-white">
              <Plus className="w-4 h-4 ml-2" />
              إضافة خدمة جديدة
            </Button>
          </Link>
        )}
      </div>

      {services.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد خدمات بعد</h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإنشاء خدمتك الأولى وابدأ في كسب المال
            </p>
            {hasPermission('service', 'create') && (
              <Link href="/services/create">
                <Button className="btn-gradient text-white">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء خدمة جديدة
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-20 p-0 pb-4">
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
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    {service.category}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    onClick={() => handleDeleteClick(service)}
                    disabled={deletingId === service.id}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
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

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {service.average_rating.toFixed(1)}
                    </span>
                    <span>({service.reviews_count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{service.total_orders}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>{service.service_images?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{service.service_packages?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4" />
                      <span>{service.service_faq?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/services/${service.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {hasPermission('service', 'update') && (
                      <Link href={`/services/${service.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف الخدمة "{serviceToDelete?.title}"؟
              <br />
              <span className="text-red-600 font-medium">لا يمكن التراجع عن هذا الإجراء.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteService}
              disabled={deletingId === serviceToDelete?.id}
              className="w-full sm:w-auto"
            >
              {deletingId === serviceToDelete?.id ? "جاري الحذف..." : "حذف الخدمة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
