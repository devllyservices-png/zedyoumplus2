import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PayPalSubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تم إلغاء الدفع عبر PayPal</h1>
        <p className="text-gray-600 mb-6">لم يتم إكمال عملية دفع اشتراكك. يمكنك المحاولة مرة أخرى.</p>
        <div className="flex flex-col gap-3">
          <Link href="/dashboard/profile?subscriptionTab=invoices">
            <Button className="w-full btn-gradient text-white">العودة إلى الاشتراكات</Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              الرجوع إلى الملف الشخصي
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

