"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  FileBarChart,
  FileImage,
  FileText,
  FolderTree,
  Headphones,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const mainNav: { href: string; label: string; icon: typeof LayoutDashboard }[] =
  [
    { href: "/admin/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
    { href: "/admin/users", label: "المستخدمون", icon: Users },
    { href: "/admin/sellers", label: "اشتراكات البائعين", icon: Users },
    { href: "/admin/invoices", label: "الفواتير", icon: FileText },
    { href: "/admin/services", label: "الخدمات", icon: Package },
    { href: "/admin/categories", label: "التصنيفات", icon: FolderTree },
    { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  ]

const placeholderNav: {
  href: string
  label: string
  icon: typeof FileBarChart
}[] = [
  { href: "/admin/reports", label: "التقارير", icon: FileBarChart },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  {
    href: "/admin/digital-products",
    label: "المنتجات الرقمية",
    icon: FileImage,
  },
  { href: "/admin/support", label: "الدعم", icon: Headphones },
]

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  const linkClass = (href: string, active: boolean) =>
    cn(
      "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
      active
        ? "bg-purple-600 text-white"
        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
    )

  return (
    <nav className={cn("space-y-1", className)}>
      <p className="mb-2 px-1 text-xs text-gray-500">القائمة</p>
      {mainNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={linkClass(href, active)}
            onClick={onNavigate}
          >
            <Icon className="size-4 shrink-0 opacity-90" />
            <span>{label}</span>
          </Link>
        )
      })}
      <Separator className="my-3 bg-gray-800" />
      <p className="mb-2 px-1 text-xs text-gray-500">قريباً</p>
      {placeholderNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={linkClass(href, active)}
            onClick={onNavigate}
          >
            <Icon className="size-4 shrink-0 opacity-90" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebarDesktop() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <NavLinks />
      </div>
    </aside>
  )
}

export function AdminSidebarMobile({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="dark w-[min(100%,20rem)] border-gray-800 bg-gray-900 p-4 text-gray-100 sm:max-w-[20rem] [&_svg]:text-gray-200"
      >
        <NavLinks onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
