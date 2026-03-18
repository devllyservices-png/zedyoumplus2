"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function ChargilySuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams?.get("order_id")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            تم تأكيد الدفع بنجاح
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            شكراً لك! تم استلام دفعتك عبر Chargily بنجاح. سيتم تأكيد طلبك من قبل مقدم الخدمة في أقرب وقت.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              رقم الطلب: <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}
          <div className="pt-4 flex flex-col gap-3">
            <Button
              className="w-full btn-gradient text-white"
              onClick={() => router.push("/dashboard")}
            >
              الذهاب إلى لوحة التحكم
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/orders")}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              عرض كل الطلبات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

