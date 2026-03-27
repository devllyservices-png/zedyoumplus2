"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PayPalSubscriptionReturnClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const run = async () => {
      if (!token) {
        router.push("/dashboard/profile?subscriptionPayment=failure")
        return
      }

      try {
        const res = await fetch("/api/paypal/subscriptions/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ paypal_order_id: token }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.subscriptionInvoiceId) {
          router.push("/dashboard/profile?subscriptionPayment=failure")
          return
        }

        router.push(
          `/dashboard/profile?subscriptionPayment=success&subscriptionTab=invoices&invoiceId=${data.subscriptionInvoiceId}`
        )
      } catch {
        router.push("/dashboard/profile?subscriptionPayment=failure")
      }
    }

    void run()
  }, [token, router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جاري تأكيد الدفع عبر PayPal للاشتراك...</p>
      </div>
    </div>
  )
}

