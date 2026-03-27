"use client"

import { AdminPlaceholder } from "@/components/admin/admin-placeholder"
import { FileImage } from "lucide-react"

export default function AdminDigitalProductsPage() {
  return (
    <AdminPlaceholder
      title="المنتجات الرقمية"
      description="إدارة المنتجات الرقمية من لوحة واحدة ستكون متاحة هنا عند ربطها بالواجهة الخلفية."
      icon={FileImage}
    />
  )
}
