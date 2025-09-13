"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Mail, Phone, MapPin, Calendar, ShoppingBag, Package, Star, DollarSign } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SellerServices from "@/components/seller-services"

export default function DashboardPage() {
  const { user, profile, logout, hasPermission } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeServices: 0,
    completedOrders: 0,
    averageRating: 0,
    totalEarnings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      fetchDashboardData()
    }
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch seller's services to calculate stats
      if (user?.role === 'seller') {
        const response = await fetch(`/api/services?seller_id=${user.id}`)
        const data = await response.json()
        
        if (response.ok && data.services) {
          const services = data.services
          const totalOrders = services.reduce((sum: number, service: any) => sum + (service.total_orders || 0), 0)
          const avgRating = services.length > 0 
            ? services.reduce((sum: number, service: any) => sum + (service.average_rating || 0), 0) / services.length
            : 0
          
          setStats({
            activeServices: services.length,
            completedOrders: totalOrders,
            averageRating: Math.round(avgRating * 10) / 10,
            totalEarnings: totalOrders * 100 // Mock calculation - replace with real earnings
          })
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>جاري التحميل...</div>
  }

  const statsData = [
    {
      title: "الخدمات النشطة",
      value: stats.activeServices.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders.toString(),
      icon: ShoppingBag,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "التقييم المتوسط",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "إجمالي الأرباح",
      value: `${stats.totalEarnings.toLocaleString()} دج`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const recentOrders = [
    {
      id: "1",
      title: "تصميم شعار احترافي",
      seller: "أحمد محمد",
      price: "5000 دج",
      status: "مكتمل",
      date: "2024-01-15",
    },
    {
      id: "2",
      title: "تطوير موقع ووردبريس",
      seller: "فاطمة بن علي",
      price: "15000 دج",
      status: "قيد التنفيذ",
      date: "2024-01-10",
    },
    {
      id: "3",
      title: "كتابة محتوى تسويقي",
      seller: "سارة قاسمي",
      price: "3000 دج",
      status: "مكتمل",
      date: "2024-01-08",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            <Button onClick={logout} variant="outline">
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || "/images/avatar-fallback.svg"} alt={profile?.display_name || user.email} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-400 to-violet-600 text-white">
                    {(profile?.display_name || user.email).charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl font-bold text-gray-900 mb-2">{profile?.display_name || user.email}</h2>
                <Badge
                  className={`mb-4 ${
                    user.role === "seller"
                      ? "bg-green-100 text-green-800"
                      : user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role === "seller" ? "مقدم خدمة" : user.role === "admin" ? "مدير" : "مشتري"}
                </Badge>

                <div className="space-y-3 text-right">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">انضم في {profile?.member_since || user.created_at}</span>
                  </div>
                </div>

                <Link href="/dashboard/profile">
                  <Button className="w-full mt-6 btn-gradient text-white">تعديل الملف الشخصي</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <Card key={index} className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold">الطلبات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{order.title}</h3>
                        <p className="text-sm text-gray-600">بواسطة {order.seller}</p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 mb-1">{order.price}</p>
                        <Badge
                          className={
                            order.status === "مكتمل" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  عرض جميع الطلبات
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/services">
                    <Button className="btn-gradient w-full text-white h-12">تصفح الخدمات</Button>
                  </Link>
                  <Link href="/digital-products">
                    <Button variant="outline" className="h-12 w-full bg-transparent">
                      المنتجات الرقمية
                    </Button>
                  </Link>
                  {hasPermission('service', 'create') && (
                    <Link href="/services/create">
                      <Button variant="outline" className="h-12 w-full bg-transparent">
                        إضافة خدمة جديدة
                      </Button>
                    </Link>
                  )}
                  {hasPermission('digital_product', 'create') && (
                    <Link href="/digital-products/create">
                      <Button variant="outline" className="h-12 w-full bg-transparent">
                        إضافة منتج رقمي
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seller Services Section */}
        {user?.role === 'seller' && (
          <div className="mt-8">
            <SellerServices />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
