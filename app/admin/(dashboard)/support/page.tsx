"use client"

import { AdminPlaceholder } from "@/components/admin/admin-placeholder"
import { Headphones } from "lucide-react"

export default function AdminSupportPage() {
  return (
    <AdminPlaceholder
      title="الدعم"
      description="تذاكر الدعم ومراسلات المستخدمين يمكن توجيهها إلى هذه الصفحة لاحقاً."
      icon={Headphones}
    />
  )
}
