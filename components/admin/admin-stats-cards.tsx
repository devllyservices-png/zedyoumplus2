"use client"

import Link from "next/link"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Clock,
  DollarSign,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  UserCheck,
  Users,
  UserX,
} from "lucide-react"

export function AdminStatsCards() {
  const { stats } = useAdmin()

  const items = [
    {
      label: "إجمالي المستخدمين",
      display: stats.totalUsers.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "المشترون",
      display: stats.totalBuyers.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "مقدمو الخدمات",
      display: stats.totalSellers.toLocaleString(),
      icon: UserX,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "الطلبات المعلقة",
      display: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "إجمالي الإيرادات",
      display: `${stats.totalRevenue.toLocaleString()} دج`,
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ]

  const quickLinks = [
    { href: "/admin/orders", label: "إدارة الطلبات", icon: ShoppingBag },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: Users },
    { href: "/admin/services", label: "إدارة الخدمات", icon: Package },
    { href: "/admin/settings", label: "إعدادات العملة", icon: Settings },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-6">
        {items.map(({ label, display, icon: Icon, iconBg, iconColor }) => (
            <Card key={label} className="border-gray-700 bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-white">{display}</p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">اختصارات سريعة</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Button
                key={href}
                asChild
                variant="outline"
                className="h-auto min-h-[48px] justify-start border-gray-600 bg-gray-800/90 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
              >
                <Link href={href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-purple-400" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
