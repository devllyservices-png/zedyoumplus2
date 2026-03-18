"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  ShoppingBag, 
  UserCheck, 
  UserX, 
  Clock, 
  DollarSign, 
  Shield,
  LogOut,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Trash2,
  ChevronDown,
  Package,
  Settings,
  LayoutDashboard
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalBuyers: number
  totalSellers: number
  pendingOrders: number
  totalRevenue: number
}

interface Order {
  id: string
  amount: number
  status: string
  created_at: string
  buyer_id: string
  seller_id: string
  service_id: string
  payment_method: string
  payment_proof_url?: string
  additional_notes?: string
  services?: {
    title: string
    description?: string
    seller_id: string
  }
  users?: {
    email: string
  }
  sellers?: {
    email: string
    profiles?: {
      display_name: string
    }
  }
}

interface Service {
  id: string
  title: string
  description: string
  created_at: string
  seller_id: string
  users?: {
    email: string
    profiles?: {
      display_name: string
    }
  }
  service_images?: Array<{
    image_url: string
    is_primary: boolean
  }>
  service_packages?: Array<{
    price: number
  }>
}

interface CurrencyConfig {
  code: string
  name: string
  rate_to_eur: number
  is_default: boolean
  is_active: boolean
}

interface User {
  id: string
  email: string
  role: string
  suspended: boolean
  created_at: string
  profiles?: {
    display_name: string
    avatar_url: string
    phone: string
  }
  totalSpent?: number
  totalEarnings?: number
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    pendingOrders: 0,
    totalRevenue: 0
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersPageSize] = useState(20)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [showDeleteServiceDialog, setShowDeleteServiceDialog] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"overview" | "settings">("overview")
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([])
  const [isSavingCurrencies, setIsSavingCurrencies] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    fetchAdminData()
  }, [user, router])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats')
      const statsData = await statsResponse.json()
      if (statsResponse.ok) {
        setStats(statsData)
      }

      await fetchOrders(1)

      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      console.log('Users fetch response:', { ok: usersResponse.ok, data: usersData })
      if (usersResponse.ok) {
        setUsers(usersData.users || [])
        console.log('Users set:', usersData.users?.length || 0, 'users')
        // Debug first user's profile data
        if (usersData.users && usersData.users.length > 0) {
          console.log('First user profile:', usersData.users[0].profiles)
          console.log('First user avatar_url:', usersData.users[0].profiles?.avatar_url)
          console.log(
            'All users profiles:',
            usersData.users.map((u: any) => ({
              email: u.email,
              avatar_url: u.profiles?.avatar_url,
              display_name: u.profiles?.display_name,
              hasProfile: !!u.profiles,
            }))
          )
        }
      } else {
        console.error('Failed to fetch users:', usersData)
      }

      // Fetch services
      const servicesResponse = await fetch('/api/admin/services')
      const servicesData = await servicesResponse.json()
      console.log('Services fetch response:', { ok: servicesResponse.ok, data: servicesData })
      if (servicesResponse.ok) {
        setServices(servicesData.services || [])
        console.log('Services set:', servicesData.services?.length || 0, 'services')
      } else {
        console.error('Failed to fetch services:', servicesData)
      }

      // Fetch currencies for settings
      const currenciesResponse = await fetch('/api/admin/currencies')
      if (currenciesResponse.ok) {
        const currenciesData = await currenciesResponse.json()
        if (Array.isArray(currenciesData.currencies)) {
          setCurrencies(currenciesData.currencies)
        }
      } else if (currenciesResponse.status === 404) {
        console.warn("Currencies API not found yet")
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async (page: number) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(ordersPageSize),
      })
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
        setOrdersTotal(data.total || 0)
        setOrdersPage(data.page || page)
      } else {
        console.error("Failed to fetch paginated orders:", data)
      }
    } catch (error) {
      console.error("Error fetching paginated orders:", error)
    }
  }

  const handleCurrencyFieldChange = (index: number, field: keyof CurrencyConfig, value: string | boolean) => {
    setCurrencies((prev) =>
      prev.map((currency, i) =>
        i === index
          ? {
              ...currency,
              [field]:
                field === "rate_to_eur"
                  ? Number(value) || 0
                  : field === "is_default" || field === "is_active"
                    ? Boolean(value)
                    : value,
            }
          : currency
      )
    )
  }

  const handleSetDefaultCurrency = (code: string) => {
    setCurrencies((prev) =>
      prev.map((c) => ({
        ...c,
        is_default: c.code === code,
      }))
    )
  }

  const ensureBaseCurrencies = () => {
    // Ensure EUR, DZD, USD exist in the list (used when API not ready or empty)
    const existingCodes = new Set(currencies.map((c) => c.code))
    const base: CurrencyConfig[] = []

    if (!existingCodes.has("EUR")) {
      base.push({
        code: "EUR",
        name: "Euro",
        rate_to_eur: 1,
        is_default: true,
        is_active: true,
      })
    }
    if (!existingCodes.has("DZD")) {
      base.push({
        code: "DZD",
        name: "Dinar Algérien",
        rate_to_eur: 150,
        is_default: false,
        is_active: true,
      })
    }
    if (!existingCodes.has("USD")) {
      base.push({
        code: "USD",
        name: "US Dollar",
        rate_to_eur: 1.1,
        is_default: false,
        is_active: true,
      })
    }

    if (base.length > 0) {
      setCurrencies((prev) => {
        const merged = [...prev, ...base]
        // Ensure exactly one default
        if (!merged.some((c) => c.is_default)) {
          return merged.map((c) => ({ ...c, is_default: c.code === "EUR" }))
        }
        return merged
      })
    }
  }

  const handleAddCustomCurrency = () => {
    setCurrencies((prev) => [
      ...prev,
      {
        code: "",
        name: "",
        rate_to_eur: 1,
        is_default: false,
        is_active: true,
      },
    ])
  }

  const handleSaveCurrencies = async () => {
    try {
      setIsSavingCurrencies(true)
      const payload = {
        currencies: currencies.map((c) => ({
          ...c,
          code: c.code.trim().toUpperCase(),
        })),
      }

      const response = await fetch("/api/admin/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error("Failed to save currencies")
        return
      }

      const data = await response.json()
      if (Array.isArray(data.currencies)) {
        setCurrencies(data.currencies)
      }
    } catch (error) {
      console.error("Error saving currencies:", error)
    } finally {
      setIsSavingCurrencies(false)
    }
  }

  const handleSuspendUser = async (user: User) => {
    setSuspendingUser(user)
    setShowSuspendDialog(true)
  }

  const confirmSuspendUser = async () => {
    if (!suspendingUser) return

    try {
      const response = await fetch(`/api/admin/users/${suspendingUser.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !suspendingUser.suspended })
      })

      if (response.ok) {
        // Update local state
        setUsers(users.map(u => 
          u.id === suspendingUser.id 
            ? { ...u, suspended: !suspendingUser.suspended }
            : u
        ))
        setShowSuspendDialog(false)
        setSuspendingUser(null)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('=== ADMIN DASHBOARD: CHANGING ORDER STATUS ===')
      console.log('Order ID:', orderId)
      console.log('New Status:', newStatus)
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
        
        console.log('Order status updated successfully')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const testNotification = async () => {
    try {
      console.log('Testing notification system...')
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'direct' })
      })

      const result = await response.json()
      console.log('Test notification result:', result)
      alert(result.message)
    } catch (error) {
      console.error('Error testing notification:', error)
      alert('Error testing notification')
    }
  }

  const handleDeleteService = async (service: Service) => {
    setDeletingService(service)
    setShowDeleteServiceDialog(true)
  }

  const confirmDeleteService = async () => {
    if (!deletingService) return

    try {
      const response = await fetch(`/api/admin/services/${deletingService.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Update local state
        setServices(services.filter(s => s.id !== deletingService.id))
        setShowDeleteServiceDialog(false)
        setDeletingService(null)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string; icon: any } } = {
      'pending': { text: 'معلق', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in_progress': { text: 'قيد التنفيذ', className: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      'completed': { text: 'مكتمل', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      'cancelled': { text: 'ملغي', className: 'bg-red-100 text-red-800', icon: Ban }
    }
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800', icon: AlertCircle }
  }

  const getAvatarUrl = (user: User) => {
    const avatarUrl = user.profiles?.avatar_url
    console.log(`Processing avatar for user ${user.email}:`, {
      hasProfile: !!user.profiles,
      avatarUrl: avatarUrl,
      profileData: user.profiles
    })
    
    if (!avatarUrl) {
      console.log(`No avatar_url for user ${user.email}, using fallback`)
      return "/images/avatar-fallback.svg"
    }
    
    // If it's already a complete URL, return it
    if (avatarUrl.startsWith('http')) {
      console.log(`Using complete URL for user ${user.email}:`, avatarUrl)
      return avatarUrl
    }
    
    // If it's a relative path, make it absolute
    if (avatarUrl.startsWith('/')) {
      console.log(`Using relative path for user ${user.email}:`, avatarUrl)
      return avatarUrl
    }
    
    // If it's just a filename, assume it's in the public directory
    const processedUrl = `/images/${avatarUrl}`
    console.log(`Processed filename for user ${user.email}:`, processedUrl)
    return processedUrl
  }

  const renderOverview = () => {
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">المشترون</p>
                  <p className="text-2xl font-bold text-white">{stats.totalBuyers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">مقدمو الخدمات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSellers}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">الطلبات المعلقة</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} دج</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              إدارة الطلبات
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              إدارة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              إدارة الخدمات
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">إدارة الطلبات</CardTitle>
                  <button
                    onClick={testNotification}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    اختبار الإشعارات
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusBadge(order.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div key={order.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm mb-1">
                              {order.services?.title || 'خدمة غير محددة'}
                            </h3>
                            <p className="text-xs text-gray-400">{order.users?.email}</p>
                          </div>
                          <Badge className={`${statusInfo.className} text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{order.amount.toLocaleString()} دج</span>
                          <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-DZ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {order.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                             order.payment_method === 'card_payment' ? 'دفع بالبطاقة' :
                             order.payment_method === 'cash' ? 'دفع نقدي' : order.payment_method}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDialog(true)
                              }}
                              className="h-8 px-3 text-xs border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white bg-blue-900/20"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              التفاصيل
                            </Button>
                            {order.payment_proof_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(order.payment_proof_url, '_blank')}
                                className="h-8 px-3 text-xs border-green-500 text-green-300 hover:bg-green-600 hover:text-white bg-green-900/20"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                الإيصال
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">الخدمة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">المشتري</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">المبلغ</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">طريقة الدفع</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">التاريخ</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">الحالة</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusInfo = getStatusBadge(order.status)
                        const StatusIcon = statusInfo.icon
                        return (
                          <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                            {/* Service */}
                            <td className="py-4 px-4">
                              <h3 className="font-semibold text-white text-sm">
                                {order.services?.title || 'خدمة غير محددة'}
                              </h3>
                            </td>
                            
                            {/* Buyer */}
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-300">{order.users?.email}</p>
                            </td>
                            
                            {/* Amount */}
                            <td className="py-4 px-4">
                              <p className="font-semibold text-white text-sm">{order.amount.toLocaleString()} دج</p>
                            </td>
                            
                            {/* Payment Method */}
                            <td className="py-4 px-4">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                {order.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                                 order.payment_method === 'card_payment' ? 'دفع بالبطاقة' :
                                 order.payment_method === 'cash' ? 'دفع نقدي' : order.payment_method}
                              </Badge>
                            </td>
                            
                            {/* Date */}
                            <td className="py-4 px-4">
                              <p className="text-sm text-gray-400">
                                {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                              </p>
                            </td>
                            
                            {/* Status */}
                            <td className="py-4 px-4 text-center">
                              <Badge className={`${statusInfo.className} text-xs`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.text}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => handleOrderStatusChange(order.id, value)}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="pending" className="text-white hover:bg-gray-700">معلق</SelectItem>
                                    <SelectItem value="in_progress" className="text-white hover:bg-gray-700">قيد التنفيذ</SelectItem>
                                    <SelectItem value="completed" className="text-white hover:bg-gray-700">مكتمل</SelectItem>
                                    <SelectItem value="cancelled" className="text-white hover:bg-gray-700">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowOrderDialog(true)
                                  }}
                                  className="h-8 px-3 text-xs border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white bg-blue-900/20"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  التفاصيل
                                </Button>
                                {order.payment_proof_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(order.payment_proof_url, '_blank')}
                                    className="h-8 px-3 text-xs border-green-500 text-green-300 hover:bg-green-600 hover:text-white bg-green-900/20"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    الإيصال
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

                {/* Orders Pagination */}
                {ordersTotal > ordersPageSize && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                    <span>
                      الصفحة {ordersPage} من {Math.max(1, Math.ceil(ordersTotal / ordersPageSize))}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ordersPage <= 1}
                        className="border-gray-600 text-gray-200 hover:bg-gray-700"
                        onClick={() => fetchOrders(ordersPage - 1)}
                      >
                        السابق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={ordersPage >= Math.ceil(ordersTotal / ordersPageSize)}
                        className="border-gray-600 text-gray-200 hover:bg-gray-700"
                        onClick={() => fetchOrders(ordersPage + 1)}
                      >
                        التالي
                      </Button>
                    </div>
                  </div>
                )}
                
                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">لا توجد طلبات</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage 
                            src={getAvatarUrl(user)} 
                            alt={user.profiles?.display_name || user.email}
                            onError={(e) => {
                              console.log('Avatar load error for user:', user.email, 'original_url:', user.profiles?.avatar_url, 'processed_url:', getAvatarUrl(user))
                              e.currentTarget.src = "/images/avatar-fallback.svg"
                            }}
                            onLoad={() => {
                              console.log('Avatar loaded successfully for user:', user.email, 'url:', getAvatarUrl(user))
                            }}
                          />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {(user.profiles?.display_name || user.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm">
                            {user.profiles?.display_name || user.email}
                          </h3>
                          <p className="text-xs text-gray-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={
                              user.role === "seller" 
                                ? "bg-green-100 text-green-800 text-xs" 
                                : user.role === "admin"
                                  ? "bg-purple-100 text-purple-800 text-xs"
                                  : "bg-blue-100 text-blue-800 text-xs"
                            }>
                              {user.role === "seller" ? "مقدم خدمة" : user.role === "admin" ? "مدير" : "مشتري"}
                            </Badge>
                            <Badge className={
                              user.suspended 
                                ? "bg-red-100 text-red-800 text-xs" 
                                : "bg-green-100 text-green-800 text-xs"
                            }>
                              {user.suspended ? "معلق" : "نشط"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          {user.role === "seller" 
                            ? `الأرباح: ${(user.totalEarnings || 0).toLocaleString()} دج`
                            : `الإنفاق: ${(user.totalSpent || 0).toLocaleString()} دج`
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Switch
                              checked={!user.suspended}
                              onCheckedChange={() => handleSuspendUser(user)}
                              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                              style={{ direction: 'ltr' }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {user.suspended ? "معلق" : "نشط"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">المستخدم</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">النوع</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">المالية</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">تاريخ الانضمام</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">الحالة</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          {/* User Info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage 
                                  src={getAvatarUrl(user)} 
                                  alt={user.profiles?.display_name || user.email}
                                  onError={(e) => {
                                    console.log('Avatar load error for user:', user.email, 'original_url:', user.profiles?.avatar_url, 'processed_url:', getAvatarUrl(user))
                                    e.currentTarget.src = "/images/avatar-fallback.svg"
                                  }}
                                  onLoad={() => {
                                    console.log('Avatar loaded successfully for user:', user.email, 'url:', getAvatarUrl(user))
                                  }}
                                />
                                <AvatarFallback className="bg-purple-600 text-white text-sm">
                                  {(user.profiles?.display_name || user.email).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-white text-sm">
                                  {user.profiles?.display_name || user.email}
                                </h3>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* User Type */}
                          <td className="py-4 px-4">
                            <Badge className={
                              user.role === "seller" 
                                ? "bg-green-100 text-green-800 text-xs" 
                                : user.role === "admin"
                                  ? "bg-purple-100 text-purple-800 text-xs"
                                  : "bg-blue-100 text-blue-800 text-xs"
                            }>
                              {user.role === "seller" ? "مقدم خدمة" : user.role === "admin" ? "مدير" : "مشتري"}
                            </Badge>
                          </td>
                          
                          {/* Financial Info */}
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-300">
                              {user.role === "seller" 
                                ? `الأرباح: ${(user.totalEarnings || 0).toLocaleString()} دج`
                                : `الإنفاق: ${(user.totalSpent || 0).toLocaleString()} دج`
                              }
                            </p>
                          </td>
                          
                          {/* Join Date */}
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-400">
                              {new Date(user.created_at).toLocaleDateString('ar-DZ')}
                            </p>
                          </td>
                          
                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            <Badge className={
                              user.suspended 
                                ? "bg-red-100 text-red-800 text-xs" 
                                : "bg-green-100 text-green-800 text-xs"
                            }>
                              {user.suspended ? "معلق" : "نشط"}
                            </Badge>
                          </td>
                          
                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="relative">
                                <Switch
                                  checked={!user.suspended}
                                  onCheckedChange={() => handleSuspendUser(user)}
                                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                                  style={{ direction: 'ltr' }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 min-w-[40px]">
                                {user.suspended ? "معلق" : "نشط"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">لا يوجد مستخدمين</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">إدارة الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile Cards View */}
                <div className="block lg:hidden space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden">
                          {service.service_images && service.service_images.length > 0 ? (
                            <img 
                              src={service.service_images[0].image_url} 
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-sm mb-1">{service.title}</h3>
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 font-semibold text-sm">
                              {service.service_packages && service.service_packages.length > 0 
                                ? `${service.service_packages[0].price.toLocaleString()} دج`
                                : 'غير محدد'
                              }
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{service.users?.email}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/services/${service.id}`, '_blank')}
                                  className="h-7 px-2 text-xs border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white bg-blue-900/20"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteService(service)}
                                  className="h-7 px-2 text-xs border-red-500 text-red-300 hover:bg-red-600 hover:text-white bg-red-900/20"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">الصورة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">الخدمة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">مقدم الخدمة</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300 w-32">السعر</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">تاريخ الإنشاء</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-300 w-40">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          {/* Image */}
                          <td className="py-4 px-4">
                            <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden">
                              {service.service_images && service.service_images.length > 0 ? (
                                <img 
                                  src={service.service_images[0].image_url} 
                                  alt={service.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          
                          {/* Service Info */}
                          <td className="py-4 px-4">
                            <div>
                              <h3 className="font-semibold text-white text-sm mb-1">{service.title}</h3>
                              <p className="text-xs text-gray-400 line-clamp-2">{service.description}</p>
                            </div>
                          </td>
                          
                          {/* Seller */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-gray-300">{service.users?.email}</p>
                              {service.users?.profiles?.display_name && (
                                <p className="text-xs text-gray-400">{service.users.profiles.display_name}</p>
                              )}
                            </div>
                          </td>
                          
                          {/* Price */}
                          <td className="py-4 px-4">
                            <p className="font-semibold text-green-400 text-sm">
                              {service.service_packages && service.service_packages.length > 0 
                                ? `${service.service_packages[0].price.toLocaleString()} دج`
                                : 'غير محدد'
                              }
                            </p>
                          </td>
                          
                          {/* Created Date */}
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-400">
                              {new Date(service.created_at).toLocaleDateString('ar-DZ')}
                            </p>
                          </td>
                          
                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/services/${service.id}`, '_blank')}
                                className="h-8 px-3 text-xs border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white bg-blue-900/20"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                عرض
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteService(service)}
                                className="h-8 px-3 text-xs border-red-500 text-red-300 hover:bg-red-600 hover:text-white bg-red-900/20"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                حذف
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {services.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">لا توجد خدمات</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    )
  }

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">إعدادات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm mb-4">
              إدارة إعدادات العملة واختيارات النظام الأخرى من هذه الصفحة.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-white text-base">إعدادات العملة</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-white hover:text-black"
                      type="button"
                      onClick={ensureBaseCurrencies}
                    >
                      تهيئة العملات الأساسية (EUR, DZD, USD)
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    جميع الأسعار داخل النظام تعتمد على اليورو كعملة أساسية، ويمكن تحويلها إلى الدينار الجزائري أو الدولار
                    أو عملات أخرى حسب أسعار الصرف التي يتم ضبطها هنا.
                  </p>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="py-2 px-2 text-right text-gray-300">الرمز</th>
                          <th className="py-2 px-2 text-right text-gray-300">الاسم</th>
                          <th className="py-2 px-2 text-right text-gray-300">سعر الصرف مقابل اليورو</th>
                          <th className="py-2 px-2 text-center text-gray-300">مفعّلة</th>
                          <th className="py-2 px-2 text-center text-gray-300">افتراضية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currencies.map((currency, index) => (
                          <tr key={`${currency.code}-${index}`} className="border-b border-gray-800/60">
                            <td className="py-2 px-2">
                              <input
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs"
                                value={currency.code}
                                placeholder="EUR"
                                onChange={(e) =>
                                  handleCurrencyFieldChange(index, "code", e.target.value.toUpperCase())
                                }
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs"
                                value={currency.name}
                                placeholder="Euro"
                                onChange={(e) => handleCurrencyFieldChange(index, "name", e.target.value)}
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="0.0001"
                                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs"
                                value={currency.rate_to_eur}
                                onChange={(e) => handleCurrencyFieldChange(index, "rate_to_eur", e.target.value)}
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCurrencyFieldChange(index, "is_active", !currency.is_active)
                                }
                                className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs ${
                                  currency.is_active
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-700 text-gray-300"
                                }`}
                              >
                                {currency.is_active ? "نعم" : "لا"}
                              </button>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleSetDefaultCurrency(currency.code)}
                                className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs ${
                                  currency.is_default
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-800 text-gray-300 border border-gray-700"
                                }`}
                              >
                                {currency.is_default ? "افتراضية" : "تعيين كافتراضية"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {currencies.map((currency, index) => (
                      <div
                        key={`${currency.code}-${index}-mobile`}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs text-center"
                            value={currency.code}
                            placeholder="EUR"
                            onChange={(e) =>
                              handleCurrencyFieldChange(index, "code", e.target.value.toUpperCase())
                            }
                          />
                          <input
                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs"
                            value={currency.name}
                            placeholder="Euro"
                            onChange={(e) => handleCurrencyFieldChange(index, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            سعر الصرف مقابل اليورو
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-100 text-xs"
                            value={currency.rate_to_eur}
                            onChange={(e) =>
                              handleCurrencyFieldChange(index, "rate_to_eur", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCurrencyFieldChange(index, "is_active", !currency.is_active)
                            }
                            className={`flex-1 inline-flex items-center justify-center px-2 py-1 rounded-full text-xs ${
                              currency.is_active
                                ? "bg-green-600 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {currency.is_active ? "مفعّلة" : "غير مفعّلة"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetDefaultCurrency(currency.code)}
                            className={`flex-1 inline-flex items-center justify-center px-2 py-1 rounded-full text-xs ${
                              currency.is_default
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 border border-gray-700"
                            }`}
                          >
                            {currency.is_default ? "العملة الافتراضية" : "تعيين كافتراضية"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800 mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-gray-100 text-gray-900 border-gray-300 hover:bg-white hover:text-black"
                        onClick={handleAddCustomCurrency}
                      >
                        إضافة عملة مخصصة
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                      onClick={handleSaveCurrencies}
                      disabled={isSavingCurrencies || currencies.length === 0}
                    >
                      {isSavingCurrencies ? "جاري الحفظ..." : "حفظ إعدادات العملة"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
              >
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${isSidebarOpen ? "rotate-180" : ""}`}
                />
              </button>
              <Shield className="w-8 h-8 text-purple-400 hidden sm:block" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">لوحة الإدارة</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-100 text-purple-800 max-w-[180px] sm:max-w-none truncate">
                {user?.email}
              </Badge>
              <Button
                onClick={logout}
                variant="outline"
                className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:text-white"
              >
                <LogOut className="w-4 h-4 ml-2" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside
            className={`
              bg-gray-900 border border-gray-800 rounded-xl p-4 w-full lg:w-64 flex-shrink-0
              transition-all duration-300
              ${isSidebarOpen ? "block" : "hidden lg:block"}
            `}
          >
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">أقسام الإدارة</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveSection("overview")
                    if (window.innerWidth < 1024) setIsSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    transition-colors
                    ${activeSection === "overview"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>الرئيسية</span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection("settings")
                    if (window.innerWidth < 1024) setIsSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    transition-colors
                    ${activeSection === "settings"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>الإعدادات</span>
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeSection === "overview" ? renderOverview() : renderSettings()}
          </main>
        </div>
      </div>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {suspendingUser?.suspended ? "إلغاء تعليق الحساب" : "تعليق الحساب"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {suspendingUser?.suspended 
                ? `هل أنت متأكد من إلغاء تعليق حساب ${suspendingUser.profiles?.display_name || suspendingUser.email}؟`
                : `هل أنت متأكد من تعليق حساب ${suspendingUser?.profiles?.display_name || suspendingUser?.email}؟`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSuspendDialog(false)}
              className="bg-gray-700 text-white border-gray-500 hover:bg-gray-600 hover:text-white"
            >
              إلغاء
            </Button>
            <Button 
              onClick={confirmSuspendUser}
              className={suspendingUser?.suspended 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
            >
              {suspendingUser?.suspended ? "إلغاء التعليق" : "تعليق الحساب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">معلومات الطلب</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">رقم الطلب:</span>
                      <span className="text-white">#{selectedOrder.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المبلغ:</span>
                      <span className="text-white font-semibold">{selectedOrder.amount.toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">طريقة الدفع:</span>
                      <span className="text-white">
                        {selectedOrder.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                         selectedOrder.payment_method === 'card_payment' ? 'دفع بالبطاقة' :
                         selectedOrder.payment_method === 'cash' ? 'دفع نقدي' : selectedOrder.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">التاريخ:</span>
                      <span className="text-white">{new Date(selectedOrder.created_at).toLocaleDateString('ar-DZ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">الحالة</h3>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const statusInfo = getStatusBadge(selectedOrder.status)
                      const StatusIcon = statusInfo.icon
                      return (
                        <Badge className={`${statusInfo.className} text-sm`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">معلومات الخدمة</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">اسم الخدمة:</span>
                    <p className="text-white font-medium">{selectedOrder.services?.title || 'خدمة غير محددة'}</p>
                  </div>
                  {selectedOrder.services?.description && (
                    <div>
                      <span className="text-gray-400 text-sm">الوصف:</span>
                      <p className="text-white text-sm">{selectedOrder.services.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Buyer & Seller Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">المشتري</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <p className="text-white">{selectedOrder.users?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">مقدم الخدمة</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <p className="text-white">{selectedOrder.sellers?.email || 'غير محدد'}</p>
                    </div>
                    {selectedOrder.sellers?.profiles?.display_name && (
                      <div>
                        <span className="text-gray-400">الاسم:</span>
                        <p className="text-white">{selectedOrder.sellers.profiles.display_name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedOrder.additional_notes && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">ملاحظات إضافية</h3>
                  <p className="text-white text-sm">{selectedOrder.additional_notes}</p>
                </div>
              )}

              {/* Payment Proof */}
              {selectedOrder.payment_proof_url && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">إيصال الدفع</h3>
                  <Button
                    onClick={() => window.open(selectedOrder.payment_proof_url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    عرض إيصال الدفع
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowOrderDialog(false)}
              className="bg-gray-700 text-white border-gray-500 hover:bg-gray-600 hover:text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={showDeleteServiceDialog} onOpenChange={setShowDeleteServiceDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">حذف الخدمة</DialogTitle>
            <DialogDescription className="text-gray-400">
              هل أنت متأكد من حذف الخدمة "{deletingService?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteServiceDialog(false)}
              className="bg-gray-700 text-white border-gray-500 hover:bg-gray-600 hover:text-white"
            >
              إلغاء
            </Button>
            <Button 
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف الخدمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
