"use client"

import { useParams } from "next/navigation"
import SellerProfile from "@/components/seller-profile"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SellerProfilePage() {
  const params = useParams()
  const sellerId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <SellerProfile sellerId={sellerId} />
        </div>
      </div>

      <Footer />
    </div>
  )
}
