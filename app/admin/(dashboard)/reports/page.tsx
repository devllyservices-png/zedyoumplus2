"use client"

import { AdminPlaceholder } from "@/components/admin/admin-placeholder"
import { FileBarChart } from "lucide-react"

export default function AdminReportsPage() {
  return (
    <AdminPlaceholder
      title="التقارير"
      description="ستتوفر هنا تقارير مفصلة عن الطلبات والإيرادات والمستخدمين عند تفعيل هذه الميزة."
      icon={FileBarChart}
    />
  )
}
