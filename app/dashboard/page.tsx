"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { Mail, Phone, MapPin, Calendar, ShoppingBag, Package, Star, DollarSign, CheckCircle, Clock, Eye, User, CreditCard, MessageSquare } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SellerServices from "@/components/seller-services"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function DashboardPage() {
  const { t, language, setLanguage } = useTranslation()
  const { user, profile, logout, hasPermission, refreshSession } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    activeServices: 0,
    completedOrders: 0,
    averageRating: 0,
    totalEarnings: 0,
    totalSpent: 0,
    inProgressOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [completingOrder, setCompletingOrder] = useState<any>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  useEffect(() => {
    if (!user) {
      // Try to refresh session before redirecting
      refreshSession().then(() => {
        if (!user) {
          router.push("/login")
        }
      })
    } else {
      fetchDashboardData()
    }
  }, [user, router, refreshSession])

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLanguageMenu && !(event.target as Element).closest('.language-menu')) {
        setShowLanguageMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLanguageMenu])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'seller') {
        // Fetch seller's orders (excluding pending)
        console.log('Fetching seller orders...')
        const response = await fetch('/api/orders/seller')
        const data = await response.json()
        
        console.log('Seller orders response:', { response: response.ok, data })
        
        if (response.ok && data.orders) {
          setRecentOrders(data.orders)
          setStats({
            activeServices: 0, // Will be calculated from services
            completedOrders: data.stats.completedOrders,
            averageRating: 0, // Will be calculated from services
            totalEarnings: data.stats.totalEarnings,
            totalSpent: 0,
            inProgressOrders: data.stats.inProgressOrders
          })
        } else {
          console.error('Failed to fetch seller orders:', data)
        }

        // Also fetch seller's services for additional stats
        const servicesResponse = await fetch(`/api/services?seller_id=${user.id}`)
        const servicesData = await servicesResponse.json()
        
        if (servicesResponse.ok && servicesData.services) {
          const services = servicesData.services
          const avgRating = services.length > 0 
            ? services.reduce((sum: number, service: any) => sum + (service.average_rating || 0), 0) / services.length
            : 0
          
          setStats(prev => ({
            ...prev,
            activeServices: services.length,
            averageRating: Math.round(avgRating * 10) / 10
          }))
        }
      } else if (user?.role === 'buyer') {
        // Fetch buyer's orders
        console.log('Fetching buyer orders...')
        const response = await fetch('/api/orders/buyer')
        const data = await response.json()
        
        console.log('Buyer orders response:', { response: response.ok, data })
        
        if (response.ok && data.orders) {
          setRecentOrders(data.orders)
          setStats({
            activeServices: 0,
            completedOrders: data.totalOrders,
            averageRating: 0,
            totalEarnings: 0,
            totalSpent: data.totalSpent,
            inProgressOrders: 0
          })
        } else {
          console.error('Failed to fetch buyer orders:', data)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>{t.dashboard.loading}</div>
  }

  const statsData = user?.role === 'buyer' ? [
    {
      title: t.dashboard.stats.buyer.totalOrders,
      value: stats.completedOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t.dashboard.stats.buyer.totalSpent,
      value: `${stats.totalSpent.toLocaleString()} دج`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t.dashboard.stats.buyer.completedOrders,
      value: recentOrders.filter((order: any) => order.status === 'completed').length.toString(),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: t.dashboard.stats.buyer.pendingOrders,
      value: recentOrders.filter((order: any) => order.status === 'pending').length.toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ] : [
    {
      title: t.dashboard.stats.seller.activeServices,
      value: stats.activeServices.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t.dashboard.stats.seller.inProgressOrders,
      value: stats.inProgressOrders.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: t.dashboard.stats.seller.completedOrders,
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t.dashboard.stats.seller.totalEarnings,
      value: `${stats.totalEarnings.toLocaleString()} دج`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'pending': { text: t.dashboard.status.pending, className: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { text: t.dashboard.status.inProgress, className: 'bg-blue-100 text-blue-800' },
      'completed': { text: t.dashboard.status.completed, className: 'bg-green-100 text-green-800' },
      'cancelled': { text: t.dashboard.status.cancelled, className: 'bg-red-100 text-red-800' }
    }
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' }
  }

  const handleCompleteOrder = (order: any) => {
    setCompletingOrder(order)
    setShowCompleteDialog(true)
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const confirmCompleteOrder = async () => {
    if (!completingOrder) return

    try {
      const response = await fetch(`/api/orders/${completingOrder.id}/complete`, {
        method: 'PATCH'
      })

      if (response.ok) {
        // Update local state
        setRecentOrders(orders => 
          orders.map((order: any) => 
            order.id === completingOrder.id 
              ? { ...order, status: 'completed' }
              : order
          )
        )
        
        // Update stats
        setStats(prev => ({
          ...prev,
          inProgressOrders: prev.inProgressOrders - 1,
          completedOrders: prev.completedOrders + 1,
          totalEarnings: prev.totalEarnings + parseFloat(completingOrder.price)
        }))
        
        setShowCompleteDialog(false)
        setCompletingOrder(null)
      } else {
        const errorData = await response.json()
        console.error('Failed to complete order:', errorData)
      }
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative language-menu">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer group border-2 shadow-sm bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-blue-400"
                  title={language === "fr" ? "Français" : language === "en" ? "English" : "العربية"}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {language === "fr" ? "FR" : language === "en" ? "EN" : "AR"}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""} text-gray-600`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setLanguage("fr")
                        setShowLanguageMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        language === "fr"
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold border-r-4 border-blue-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-1 text-left">FR - Français</span>
                      {language === "fr" && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en")
                        setShowLanguageMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        language === "en"
                          ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold border-r-4 border-red-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-1 text-left">EN - English</span>
                      {language === "en" && (
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("ar")
                        setShowLanguageMenu(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                        language === "ar"
                          ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold border-r-4 border-green-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-1 text-right">AR - العربية</span>
                      {language === "ar" && (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <Button onClick={logout} variant="outline">
                {t.dashboard.logout}
              </Button>
            </div>
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
                  {user.role === "seller" ? t.header.user.seller : user.role === "admin" ? t.header.user.admin : t.header.user.buyer}
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
                    <span className="text-sm text-gray-600">{t.dashboard.joinDate} {profile?.member_since || user.created_at}</span>
                  </div>
                </div>

                <Link href="/dashboard/profile">
                  <Button className="w-full mt-6 btn-gradient text-white">{t.dashboard.editProfile}</Button>
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
                <CardTitle className="text-xl font-bold">
                  {user?.role === 'buyer' ? t.dashboard.orders.myOrders : t.dashboard.orders.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="mr-2 text-gray-600">{t.dashboard.loading}</span>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">الخدمة</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">
                              {user?.role === 'buyer' ? 'المقدم' : 'المشتري'}
                            </th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">المبلغ</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((order: any) => {
                            const statusInfo = getStatusBadge(order.status)
                            return (
                              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{order.title}</h3>
                                    {order.package && (
                                      <p className="text-xs text-purple-600">الباقة: {order.package}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <p className="text-sm text-gray-600">
                                    {user?.role === 'buyer' ? order.seller : order.buyer}
                                  </p>
                                </td>
                                <td className="py-4 px-4">
                                  <p className="font-bold text-gray-900">{order.price.toLocaleString()} دج</p>
                                </td>
                                <td className="py-4 px-4">
                                  <Badge className={statusInfo.className}>
                                    {statusInfo.text}
                                  </Badge>
                                </td>
                                <td className="py-4 px-4">
                                  <p className="text-xs text-gray-500">{order.date}</p>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewDetails(order)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      {t.dashboard.orders.details}
                                    </Button>
                                    {user?.role === 'seller' && order.status === 'in_progress' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleCompleteOrder(order)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {t.dashboard.orders.complete}
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                      {recentOrders.map((order: any) => {
                        const statusInfo = getStatusBadge(order.status)
                        return (
                          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{order.title}</h3>
                                {order.package && (
                                  <p className="text-xs text-purple-600 mb-1">الباقة: {order.package}</p>
                                )}
                                <p className="text-sm text-gray-600 mb-1">
                                  {user?.role === 'buyer' ? `بواسطة ${order.seller}` : `المشتري: ${order.buyer}`}
                                </p>
                                <p className="text-xs text-gray-500">{order.date}</p>
                              </div>
                              <div className="text-left ml-3">
                                <p className="font-bold text-gray-900 mb-2">{order.price.toLocaleString()} دج</p>
                                <Badge className={statusInfo.className}>
                                  {statusInfo.text}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(order)}
                                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                {t.dashboard.orders.details}
                              </Button>
                              {user?.role === 'seller' && order.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteOrder(order)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {t.dashboard.orders.complete}
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : user?.role === 'buyer' ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-gray-200/50">
                    <div className="w-16 h-16 bg-gray-300/60 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">{t.dashboard.orders.noOrders}</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                      {t.dashboard.orders.noOrdersDesc}
                    </p>
                    <div className="space-y-6">
                      <Link href="/services">
                        <Button variant="outline" className="px-6 py-2 text-sm text-gray-600 border-gray-300 hover:bg-gray-100">
                          {t.dashboard.orders.browseServices}
                        </Button>
                      </Link>
                      <p className="text-xs text-gray-400">
                        {t.dashboard.orders.startTip}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">{t.dashboard.orders.noRecentOrders}</p>
                  </div>
                )}
                
                {recentOrders.length > 0 && (
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    {t.dashboard.orders.viewAll}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{t.dashboard.quickActions.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/services">
                    <Button className="btn-gradient w-full text-white h-12">{t.dashboard.quickActions.browseServices}</Button>
                  </Link>
                  <Link href="/digital-products">
                    <Button variant="outline" className="h-12 w-full bg-transparent">
                      {t.dashboard.quickActions.digitalProducts}
                    </Button>
                  </Link>
                  {user?.role === 'buyer' && (
                    <Link href="/orders">
                      <Button variant="outline" className="h-12 w-full bg-transparent">
                        {t.dashboard.quickActions.allOrders}
                      </Button>
                    </Link>
                  )}
                  {hasPermission('service', 'create') && (
                    <Link href="/services/create">
                      <Button variant="outline" className="h-12 w-full bg-transparent">
                        {t.dashboard.quickActions.addService}
                      </Button>
                    </Link>
                  )}
                  {hasPermission('digital_product', 'create') && (
                    <Link href="/digital-products/create">
                      <Button variant="outline" className="h-12 w-full bg-transparent">
                        {t.dashboard.quickActions.addDigitalProduct}
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

      {/* Complete Order Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">{t.dashboard.completeDialog.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t.dashboard.completeDialog.description}
            </DialogDescription>
          </DialogHeader>
          
          {completingOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{completingOrder.title}</h3>
                <p className="text-sm text-gray-600">{t.dashboard.completeDialog.buyer}: {completingOrder.buyer}</p>
                <p className="text-sm text-gray-600">{t.dashboard.completeDialog.amount}: {completingOrder.price.toLocaleString()} دج</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{t.dashboard.completeDialog.importantInfo}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t.dashboard.completeDialog.info1}</li>
                  <li>• {t.dashboard.completeDialog.info2}</li>
                  <li>• {t.dashboard.completeDialog.info3}</li>
                  <li>• {t.dashboard.completeDialog.info4}</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCompleteDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t.dashboard.completeDialog.cancel}
            </Button>
            <Button 
              onClick={confirmCompleteOrder}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.dashboard.completeDialog.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">{t.dashboard.orderDetails.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t.dashboard.orderDetails.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {t.dashboard.orderDetails.orderInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t.dashboard.orderDetails.serviceTitle}</p>
                    <p className="font-medium text-gray-900">{selectedOrder.title}</p>
                  </div>
                  {selectedOrder.package && (
                    <div>
                      <p className="text-sm text-gray-600">{t.dashboard.orderDetails.selectedPackage}</p>
                      <p className="font-medium text-gray-900">{selectedOrder.package}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">{t.dashboard.orderDetails.amount}</p>
                    <p className="font-bold text-green-600 text-lg">{selectedOrder.price.toLocaleString()} دج</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.dashboard.orderDetails.status}</p>
                    <Badge className={getStatusBadge(selectedOrder.status).className}>
                      {getStatusBadge(selectedOrder.status).text}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.dashboard.orderDetails.orderDate}</p>
                    <p className="font-medium text-gray-900">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t.dashboard.orderDetails.paymentMethod}</p>
                    <p className="font-medium text-gray-900">{selectedOrder.payment_method || t.dashboard.orderDetails.notSpecified}</p>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {user?.role === 'buyer' ? t.dashboard.orderDetails.providerInfo : t.dashboard.orderDetails.buyerInfo}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.role === 'buyer' ? selectedOrder.seller : selectedOrder.buyer}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'buyer' ? selectedOrder.sellerEmail : selectedOrder.buyerEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedOrder.additional_notes && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {t.dashboard.orderDetails.additionalNotes}
                  </h3>
                  <p className="text-gray-700">{selectedOrder.additional_notes}</p>
                </div>
              )}

              {/* Payment Information */}
              {selectedOrder.payment_proof_url && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t.dashboard.orderDetails.paymentProof}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-green-800 font-medium">
                      {t.dashboard.orderDetails.paymentVerified}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowOrderDetails(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t.dashboard.orderDetails.close}
            </Button>
            {user?.role === 'seller' && selectedOrder?.status === 'in_progress' && (
              <Button 
                onClick={() => {
                  setShowOrderDetails(false)
                  handleCompleteOrder(selectedOrder)
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t.dashboard.orderDetails.completeProject}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
