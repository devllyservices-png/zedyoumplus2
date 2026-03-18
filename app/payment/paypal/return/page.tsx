import { Suspense } from "react"
import PayPalReturnClient from "./PayPalReturnClient"

function PayPalReturnFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جاري تأكيد الدفع عبر PayPal...</p>
      </div>
    </div>
  )
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={<PayPalReturnFallback />}>
      <PayPalReturnClient />
    </Suspense>
  )
}

