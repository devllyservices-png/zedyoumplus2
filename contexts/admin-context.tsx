"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  type LucideIcon,
} from "lucide-react"

export interface AdminStats {
  totalUsers: number
  totalBuyers: number
  totalSellers: number
  pendingOrders: number
  totalRevenue: number
}

export interface AdminOrder {
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

export interface AdminService {
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

export interface CurrencyConfig {
  code: string
  name: string
  rate_to_eur: number
  is_default: boolean
  is_active: boolean
}

export interface AdminUser {
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

export interface StatusBadgeInfo {
  text: string
  className: string
  icon: LucideIcon
}

interface AdminContextValue {
  stats: AdminStats
  orders: AdminOrder[]
  users: AdminUser[]
  services: AdminService[]
  loading: boolean
  ordersPage: number
  ordersPageSize: number
  ordersTotal: number
  currencies: CurrencyConfig[]
  isSavingCurrencies: boolean
  suspendingUser: AdminUser | null
  showSuspendDialog: boolean
  setShowSuspendDialog: (open: boolean) => void
  selectedOrder: AdminOrder | null
  showOrderDialog: boolean
  setShowOrderDialog: (open: boolean) => void
  deletingService: AdminService | null
  showDeleteServiceDialog: boolean
  setShowDeleteServiceDialog: (open: boolean) => void
  fetchOrders: (page: number) => Promise<void>
  refreshAdminData: () => Promise<void>
  handleCurrencyFieldChange: (
    index: number,
    field: keyof CurrencyConfig,
    value: string | boolean
  ) => void
  handleSetDefaultCurrency: (code: string) => void
  ensureBaseCurrencies: () => void
  handleAddCustomCurrency: () => void
  handleSaveCurrencies: () => Promise<void>
  handleSuspendUser: (user: AdminUser) => void
  confirmSuspendUser: () => Promise<void>
  handleOrderStatusChange: (orderId: string, newStatus: string) => Promise<void>
  testNotification: () => Promise<void>
  handleDeleteService: (service: AdminService) => void
  confirmDeleteService: () => Promise<void>
  getStatusBadge: (status: string) => StatusBadgeInfo
  getAvatarUrl: (user: AdminUser) => string
  setSuspendingUser: (user: AdminUser | null) => void
  setSelectedOrder: (order: AdminOrder | null) => void
  setDeletingService: (service: AdminService | null) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

const initialStats: AdminStats = {
  totalUsers: 0,
  totalBuyers: 0,
  totalSellers: 0,
  pendingOrders: 0,
  totalRevenue: 0,
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersPage, setOrdersPage] = useState(1)
  const ordersPageSize = 20
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [suspendingUser, setSuspendingUser] = useState<AdminUser | null>(null)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [deletingService, setDeletingService] = useState<AdminService | null>(
    null
  )
  const [showDeleteServiceDialog, setShowDeleteServiceDialog] = useState(false)
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([])
  const [isSavingCurrencies, setIsSavingCurrencies] = useState(false)

  const fetchOrders = useCallback(async (page: number) => {
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
  }, [ordersPageSize])

  const refreshAdminData = useCallback(async () => {
    try {
      setLoading(true)

      const statsResponse = await fetch("/api/admin/stats")
      const statsData = await statsResponse.json()
      if (statsResponse.ok) {
        setStats(statsData)
      }

      await fetchOrders(1)

      const usersResponse = await fetch("/api/admin/users")
      const usersData = await usersResponse.json()
      if (usersResponse.ok) {
        setUsers(usersData.users || [])
      } else {
        console.error("Failed to fetch users:", usersData)
      }

      const servicesResponse = await fetch("/api/admin/services")
      const servicesData = await servicesResponse.json()
      if (servicesResponse.ok) {
        setServices(servicesData.services || [])
      } else {
        console.error("Failed to fetch services:", servicesData)
      }

      const currenciesResponse = await fetch("/api/admin/currencies")
      if (currenciesResponse.ok) {
        const currenciesData = await currenciesResponse.json()
        if (Array.isArray(currenciesData.currencies)) {
          setCurrencies(currenciesData.currencies)
        }
      } else if (currenciesResponse.status === 404) {
        console.warn("Currencies API not found yet")
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }, [fetchOrders])

  const handleCurrencyFieldChange = (
    index: number,
    field: keyof CurrencyConfig,
    value: string | boolean
  ) => {
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

  const handleSuspendUser = (user: AdminUser) => {
    setSuspendingUser(user)
    setShowSuspendDialog(true)
  }

  const confirmSuspendUser = async () => {
    if (!suspendingUser) return

    try {
      const response = await fetch(
        `/api/admin/users/${suspendingUser.id}/suspend`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: !suspendingUser.suspended }),
        }
      )

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === suspendingUser.id
              ? { ...u, suspended: !suspendingUser.suspended }
              : u
          )
        )
        setShowSuspendDialog(false)
        setSuspendingUser(null)
      }
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const testNotification = async () => {
    try {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: "direct" }),
      })

      const result = await response.json()
      alert(result.message)
    } catch (error) {
      console.error("Error testing notification:", error)
      alert("Error testing notification")
    }
  }

  const handleDeleteService = (service: AdminService) => {
    setDeletingService(service)
    setShowDeleteServiceDialog(true)
  }

  const confirmDeleteService = async () => {
    if (!deletingService) return

    try {
      const response = await fetch(`/api/admin/services/${deletingService.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setServices((prev) => prev.filter((s) => s.id !== deletingService.id))
        setShowDeleteServiceDialog(false)
        setDeletingService(null)
      }
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  const getStatusBadge = useCallback((status: string): StatusBadgeInfo => {
    const statusMap: Record<string, StatusBadgeInfo> = {
      pending: {
        text: "معلق",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      in_progress: {
        text: "قيد التنفيذ",
        className: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
      },
      completed: {
        text: "مكتمل",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        text: "ملغي",
        className: "bg-red-100 text-red-800",
        icon: Ban,
      },
    }
    return (
      statusMap[status] || {
        text: status,
        className: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
      }
    )
  }, [])

  const getAvatarUrl = useCallback((user: AdminUser) => {
    const avatarUrl = user.profiles?.avatar_url
    if (!avatarUrl) {
      return "/images/avatar-fallback.svg"
    }
    if (avatarUrl.startsWith("http")) {
      return avatarUrl
    }
    if (avatarUrl.startsWith("/")) {
      return avatarUrl
    }
    return `/images/${avatarUrl}`
  }, [])

  const value: AdminContextValue = {
    stats,
    orders,
    users,
    services,
    loading,
    ordersPage,
    ordersPageSize,
    ordersTotal,
    currencies,
    isSavingCurrencies,
    suspendingUser,
    showSuspendDialog,
    setShowSuspendDialog,
    selectedOrder,
    showOrderDialog,
    setShowOrderDialog,
    deletingService,
    showDeleteServiceDialog,
    setShowDeleteServiceDialog,
    fetchOrders,
    refreshAdminData,
    handleCurrencyFieldChange,
    handleSetDefaultCurrency,
    ensureBaseCurrencies,
    handleAddCustomCurrency,
    handleSaveCurrencies,
    handleSuspendUser,
    confirmSuspendUser,
    handleOrderStatusChange,
    testNotification,
    handleDeleteService,
    confirmDeleteService,
    getStatusBadge,
    getAvatarUrl,
    setSuspendingUser,
    setSelectedOrder,
    setDeletingService,
  }

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return ctx
}
