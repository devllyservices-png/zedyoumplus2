"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PayPalReturnClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const capture = async () => {
      if (!token) {
        router.push("/checkout")
        return
      }

      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paypal_order_id: token }),
        })

        const data = await res.json()

        if (!res.ok) {
          router.push("/payment/chargily/failure")
          return
        }

        if (data.orderId) {
          router.push(`/checkout/success?orderId=${data.orderId}`)
        } else {
          router.push("/orders")
        }
      } catch (error) {
        console.error("PayPal return capture error:", error)
        router.push("/payment/chargily/failure")
      }
    }

    capture()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جاري تأكيد الدفع عبر PayPal...</p>
      </div>
    </div>
  )
}

