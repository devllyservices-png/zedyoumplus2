"use client"

import { AdminPlaceholder } from "@/components/admin/admin-placeholder"
import { BarChart3 } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholder
      title="التحليلات"
      description="لوحة تحليلات ورسوم بيانية لسلوك المنصة ستُضاف لاحقاً دون الحاجة لتغيير مسارات التنقل."
      icon={BarChart3}
    />
  )
}
