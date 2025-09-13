"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Package, 
  Clock, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Order {
  id: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  completed_at?: string
  services?: {
    title: string
    category: string
    primary_image?: string
  }
  service_packages?: {
    name: string
    price: number
    delivery_time: string
  }
  buyer?: {
    profiles?: {
      display_name: string
      avatar_url?: string
    }
  }
  seller?: {
    profiles?: {
      display_name: string
      avatar_url?: string
      is_verified: boolean
    }
  }
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [orderType, setOrderType] = useState<'buyer' | 'seller'>('buyer')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, orderType, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: orderType,
        limit: '50'
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders || [])
      } else {
        setError(data.error || 'فشل في تحميل الطلبات')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار'
      case 'in_progress':
        return 'قيد التنفيذ'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغي'
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح بالوصول</h1>
          <p className="text-gray-600 mb-6">يجب تسجيل الدخول لعرض الطلبات</p>
          <Link href="/login">
            <Button>تسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            طلباتي
          </h1>
          <p className="text-gray-600">إدارة طلباتك كعميل أو بائع</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={orderType} onValueChange={(value: 'buyer' | 'seller') => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع الطلبات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">طلباتي كعميل</SelectItem>
                    <SelectItem value="seller">طلباتي كبائع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الطلبات...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchOrders} variant="outline">
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600 mb-6">
                {orderType === 'buyer' 
                  ? 'لم تقم بطلب أي خدمات بعد' 
                  : 'لم تتلق أي طلبات بعد'
                }
              </p>
              <Link href="/services">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  تصفح الخدمات
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {order.services?.title || 'خدمة غير محددة'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>#{order.id.slice(-8)}</span>
                            <span>{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeClass(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="mr-1">{getStatusText(order.status)}</span>
                        </Badge>
                      </div>

                      {/* Package Info */}
                      {order.service_packages && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">{order.service_packages.name}</span>
                            <span className="text-sm text-gray-500">
                              ({order.service_packages.delivery_time})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={
                              orderType === 'buyer' 
                                ? order.seller?.profiles?.avatar_url 
                                : order.buyer?.profiles?.avatar_url
                            } 
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                            {orderType === 'buyer' 
                              ? order.seller?.profiles?.display_name?.charAt(0) || 'ب'
                              : order.buyer?.profiles?.display_name?.charAt(0) || 'ع'
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {orderType === 'buyer' 
                                ? order.seller?.profiles?.display_name || 'البائع'
                                : order.buyer?.profiles?.display_name || 'العميل'
                              }
                            </span>
                            {orderType === 'buyer' && order.seller?.profiles?.is_verified && (
                              <Shield className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {orderType === 'buyer' ? 'البائع' : 'العميل'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="lg:w-48 flex flex-col justify-between">
                      <div className="text-right mb-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {order.amount} دج
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            عرض التفاصيل
                          </Button>
                        </Link>
                        {(order.status === 'pending' || order.status === 'in_progress') && (
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            التواصل
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

