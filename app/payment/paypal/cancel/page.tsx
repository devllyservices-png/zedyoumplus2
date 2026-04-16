"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PayPalCancelPage() {
  const router = useRouter()

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null

    // On cancel we don't need the token; just send user back to checkout with a flag.
    const sp = new URLSearchParams()
    if (token) sp.set("paypalStatus", "canceled")
    router.replace(`/checkout${sp.toString() ? `?${sp.toString()}` : ""}`)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جارٍ إلغاء عملية الدفع عبر PayPal وإعادتك إلى صفحة الدفع...</p>
      </div>
    </div>
  )
}

