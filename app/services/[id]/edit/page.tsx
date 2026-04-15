"use client"

import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { CreateServiceForm } from "@/app/services/create/page"

export default function EditServicePage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""

  return (
    <ProtectedRoute requiredUserType="seller">
      <CreateServiceForm editServiceId={id} />
    </ProtectedRoute>
  )
}
