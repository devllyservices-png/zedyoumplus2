"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Menu, Shield } from "lucide-react"

type AdminHeaderProps = {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth()

  return (
    <div className="border-b border-gray-700 bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-gray-200 hover:bg-gray-700 lg:hidden"
              onClick={onMenuClick}
              aria-label="فتح القائمة"
            >
              <Menu className="size-6" />
            </Button>
            <Shield className="hidden h-8 w-8 shrink-0 text-purple-400 sm:block" />
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
              لوحة الإدارة
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Badge className="max-w-[140px] truncate bg-purple-100 text-purple-800 sm:max-w-none">
              {user?.email}
            </Badge>
            <Button
              onClick={() => void logout()}
              variant="outline"
              className="border-purple-500 bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
            >
              <LogOut className="ml-2 h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
