import { Suspense } from "react"
import PayPalSubscriptionReturnClient from "./PayPalSubscriptionReturnClient"

function Fallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700">جاري تأكيد الدفع عبر PayPal للاشتراك...</p>
      </div>
    </div>
  )
}

export default function PayPalSubscriptionReturnPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <PayPalSubscriptionReturnClient />
    </Suspense>
  )
}

