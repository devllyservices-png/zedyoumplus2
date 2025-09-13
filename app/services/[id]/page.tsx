"use client"

import { useParams } from "next/navigation"
import ServiceDetail from "@/components/service-detail"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ServiceDetailPage() {
  const params = useParams()
  const serviceId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8">
        <ServiceDetail serviceId={serviceId} />
      </div>

      <Footer />
    </div>
  )
}