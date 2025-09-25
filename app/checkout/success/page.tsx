"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { CheckCircle, Home, Download, MessageCircle, Calendar, Package, Sparkles } from "lucide-react"
import { Footer } from "@/components/footer"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(true)
  const [orderData, setOrderData] = useState({
    orderId: '',
    serviceTitle: '',
    packageName: '',
    price: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  // Get URL parameters from query string
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      setOrderData({
        orderId: searchParams.get('orderId') || '',
        serviceTitle: searchParams.get('serviceTitle') || '',
        packageName: searchParams.get('package') || '',
        price: searchParams.get('price') || ''
      })
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const generateConfetti = () => {
    const confettiElements = []
    for (let i = 0; i < 50; i++) {
      confettiElements.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: i % 3 === 0 ? "#667eea" : i % 3 === 1 ? "#764ba2" : "#f093fb",
          }}
        />,
      )
    }
    return confettiElements
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />

      {/* Confetti Animation */}
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-10">{generateConfetti()}</div>}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 تم تأكيد طلبك بنجاح!</h1>
            <p className="text-xl text-gray-600 mb-2">شكراً لك على ثقتك بنا</p>
            <p className="text-gray-500">سيتم التواصل معك قريباً لبدء العمل على مشروعك</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">تفاصيل الطلب</h2>
                      <p className="text-gray-600">رقم الطلب: #{orderData.orderId}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">الخدمة المطلوبة:</h3>
                      <p className="text-gray-700 text-lg">
                        {orderData.serviceTitle ? decodeURIComponent(orderData.serviceTitle) : "خدمة مطلوبة"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className="gradient-bg text-white border-0 px-4 py-2 text-sm">
                        {orderData.packageName ? decodeURIComponent(orderData.packageName) : "الباقة المختارة"}
                      </Badge>
                      <span className="text-2xl font-bold gradient-brand-text">
                        {orderData.price || "0"} دج
                      </span>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">حالة الطلب</h4>
                      </div>
                      <p className="text-green-800">
                        تم استلام طلبك وسيتم مراجعته خلال 24 ساعة. سنتواصل معك عبر البريد الإلكتروني أو الهاتف لتأكيد
                        التفاصيل وبدء العمل.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    الخطوات التالية
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">مراجعة الطلب</h4>
                        <p className="text-blue-800 text-sm">سيتم مراجعة طلبك والتأكد من جميع التفاصيل خلال 24 ساعة</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900">التواصل معك</h4>
                        <p className="text-purple-800 text-sm">
                          سنتواصل معك لتأكيد التفاصيل وجمع أي معلومات إضافية مطلوبة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900">بدء العمل</h4>
                        <p className="text-green-800 text-sm">
                          سيبدأ فريقنا في العمل على مشروعك وفقاً للجدول الزمني المتفق عليه
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4">إجراءات سريعة</h3>

                  <Button
                    onClick={() => router.push("/")}
                    className="w-full btn-gradient text-white h-12 font-semibold"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    العودة للرئيسية
                  </Button>

                  <Button variant="outline" className="w-full h-12 border-purple-200 hover:bg-purple-50 bg-transparent">
                    <Download className="w-5 h-5 mr-2" />
                    تحميل فاتورة الطلب
                  </Button>

                  <Button variant="outline" className="w-full h-12 border-blue-200 hover:bg-blue-50 bg-transparent">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    تواصل مع الدعم
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">تحتاج مساعدة؟</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">البريد الإلكتروني:</p>
                      <p className="opacity-90">support@example.com</p>
                    </div>
                    <div>
                      <p className="font-medium">الهاتف:</p>
                      <p className="opacity-90">+213 555 123 456</p>
                    </div>
                    <div>
                      <p className="font-medium">ساعات العمل:</p>
                      <p className="opacity-90">الأحد - الخميس: 9:00 - 18:00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
