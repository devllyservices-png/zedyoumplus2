"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminProvider, useAdmin } from "@/contexts/admin-context"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  AdminSidebarDesktop,
  AdminSidebarMobile,
} from "@/components/admin/admin-sidebar"
import { AdminDialogs } from "@/components/admin/admin-dialogs"

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { refreshAdminData, loading } = useAdmin()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== "admin") {
      router.replace("/admin/login")
      return
    }
    void refreshAdminData()
  }, [user, router, refreshAdminData, authLoading])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-300">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark min-h-screen bg-gray-900 text-foreground">
      <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <AdminSidebarDesktop />
          <div className="lg:hidden">
            <AdminSidebarMobile
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
            />
          </div>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <AdminDialogs />
    </div>
  )
}

export default function AdminDashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  )
}
