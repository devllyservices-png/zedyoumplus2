"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  Banknote,
  Building2,
  Check,
  CreditCard,
  Upload,
  ArrowLeft,
} from "lucide-react"

type PaymentMethod = "bank_transfer" | "card_payment" | "cash" | "paypal"

export default function SubscriptionCheckoutPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "seller") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleFileUpload = (file: File | null) => {
    setPaymentProof(file)
  }

  const onSubmit = async () => {
    setError("")
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("payment_method", paymentMethod)
      formData.append("instructions", notes || "")

      if (paymentMethod === "bank_transfer") {
        if (!paymentProof) {
          setError("يرجى رفع إيصال الدفع لتحويل بنكي")
          return
        }
        formData.append("payment_proof", paymentProof)
      }

      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "فشل إنشاء طلب الاشتراك")
      }

      if (paymentMethod === "card_payment" && data.chargilyCheckoutUrl) {
        window.location.href = data.chargilyCheckoutUrl
        return
      }

      if (paymentMethod === "paypal" && data.approvalUrl) {
        window.location.href = data.approvalUrl
        return
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl)
        return
      }

      router.push("/dashboard/profile?subscriptionTab=invoices")
    } catch (e: any) {
      setError(e?.message || "حدث خطأ في إنشاء طلب الاشتراك")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2 hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>الاشتراك</span>
                <span>/</span>
                <span className="gradient-brand-text font-medium">الدفع</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">دفع اشتراك المتجر</h1>
              <p className="text-gray-600">اختر طريقة الدفع ثم أكمل الطلب.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {error ? (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              ) : null}

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle>طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <div className="space-y-6">
                      <div
                        className={`transition-all duration-300 ${
                          paymentMethod === "bank_transfer"
                            ? "gradient-border bg-gradient-to-r from-blue-50 to-purple-50"
                            : "border border-gray-200 hover:border-blue-300"
                        } rounded-xl`}
                      >
                        <div className="p-6">
                          <Label htmlFor="bank_transfer" className="cursor-pointer block">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-7 h-7 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">تحويل بنكي</h3>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    قم بالتحويل وارفع إيصال الدفع
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "bank_transfer" ? (
                                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : null}
                            </div>
                          </Label>
                          <RadioGroupItem value="bank_transfer" id="bank_transfer" className="sr-only" />

                          <div className="mt-5">
                            <Label htmlFor="payment_proof" className="block mb-2 font-semibold text-gray-700">
                              رفع إيصال الدفع *
                            </Label>
                            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center bg-white">
                              <input
                                type="file"
                                id="payment_proof"
                                accept="image/*,.pdf,.avif"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null
                                  handleFileUpload(f)
                                }}
                              />
                              <Label htmlFor="payment_proof" className="cursor-pointer block">
                                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                  <Upload className="w-8 h-8 text-purple-600" />
                                </div>
                                <p className="text-base font-medium text-gray-900 mb-2 break-words">
                                  {paymentProof ? paymentProof.name : "اضغط لرفع إيصال الدفع"}
                                </p>
                                <p className="text-xs text-gray-600">
                                  صور أو PDF (حد أقصى 5MB)
                                </p>
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ${
                          paymentMethod === "card_payment"
                            ? "gradient-border bg-gradient-to-r from-green-50 to-emerald-50"
                            : "border border-gray-200 hover:border-green-300"
                        } rounded-xl`}
                      >
                        <div className="p-6">
                          <Label htmlFor="card_payment" className="cursor-pointer block">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CreditCard className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    دفع بالبطاقة
                                  </h3>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    سيتم تحويلك لصفحة دفع آمنة عبر Chargily
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "card_payment" ? (
                                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : null}
                            </div>
                          </Label>
                          <RadioGroupItem value="card_payment" id="card_payment" className="sr-only" />
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ${
                          paymentMethod === "paypal"
                            ? "gradient-border bg-gradient-to-r from-blue-50 to-sky-50"
                            : "border border-gray-200 hover:border-sky-300"
                        } rounded-xl`}
                      >
                        <div className="p-6">
                          <Label htmlFor="paypal" className="cursor-pointer block">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CreditCard className="w-7 h-7 text-sky-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">الدفع عبر PayPal</h3>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    سيتم فتح واجهة PayPal لإتمام الدفع
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "paypal" ? (
                                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : null}
                            </div>
                          </Label>
                          <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ${
                          paymentMethod === "cash"
                            ? "gradient-border bg-gradient-to-r from-orange-50 to-yellow-50"
                            : "border border-gray-200 hover:border-orange-300"
                        } rounded-xl`}
                      >
                        <div className="p-6">
                          <Label htmlFor="cash" className="cursor-pointer block">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Banknote className="w-7 h-7 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">دفع نقدي</h3>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    سيتم تحويل طلبك للإدارة للموافقة
                                  </p>
                                </div>
                              </div>
                              {paymentMethod === "cash" ? (
                                <div className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : null}
                            </div>
                          </Label>
                          <RadioGroupItem value="cash" id="cash" className="sr-only" />
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="mt-6">
                    <Label htmlFor="notes" className="block mb-2 font-semibold text-gray-700">
                      ملاحظات إضافية (اختياري)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي تفاصيل تساعد الإدارة في معالجة طلب الاشتراك..."
                      rows={3}
                    />
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-600">
                      الاشتراك الأساسي: <span className="font-semibold">1 شهر</span> بسعر ثابت{" "}
                      <span className="font-semibold">20$</span>
                    </div>
                    <Button
                      onClick={() => void onSubmit()}
                      className="btn-gradient text-white h-12 text-lg font-semibold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "جاري المعالجة..." : "تأكيد الدفع"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white sticky top-8">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المدة</span>
                      <span className="font-semibold">1 شهر</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">السعر</span>
                      <span className="font-semibold">20$</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      بعد الدفع، يلزم موافقة الإدارة لتفعيل المتجر والخدمات.
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">خطوات الدفع</h3>
                    <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                      <li>اختر طريقة الدفع واكمل البيانات المطلوبة.</li>
                      <li>سيتم إنشاء فاتورة اشتراك بانتظار موافقة الإدارة.</li>
                      <li>بعد الموافقة، يتم تفعيل المتجر والخدمات تلقائياً.</li>
                    </ol>
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

