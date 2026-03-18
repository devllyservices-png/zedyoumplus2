"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function ChargilyFailureClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams?.get("order_id")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            لم يتم إكمال عملية الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            يبدو أن عملية الدفع عبر Chargily لم تكتمل أو تم إلغاؤها. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              رقم الطلب: <span className="font-mono font-semibold">{orderId}</span>
            </p>
          )}
          <div className="pt-4 flex flex-col gap-3">
            <Button
              className="w-full btn-gradient text-white"
              onClick={() => router.push("/checkout")}
            >
              إعادة المحاولة
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/services")}
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              الرجوع إلى الخدمات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

