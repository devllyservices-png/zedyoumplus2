"use client"

import { useParams } from "next/navigation"
import SellerProfile from "@/components/seller-profile"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SellerProfilePage() {
  const params = useParams()
  const sellerId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <SellerProfile sellerId={sellerId} />
      </div>

      <Footer />
    </div>
  )
}
