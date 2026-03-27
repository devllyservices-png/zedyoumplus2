"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutDashboard } from "lucide-react"

export function AdminPlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/80 text-purple-400">
          <Icon className="h-8 w-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-sm leading-relaxed text-gray-400">{description}</p>
          <p className="text-sm font-medium text-purple-300">قريباً</p>
        </div>
        <Button
          asChild
          variant="outline"
          className="min-h-[44px] border-gray-600 bg-gray-800 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
        >
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
