"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import {
  ArrowLeft,
  Upload,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  Shield,
  Package,
  Clock,
  RefreshCw,
} from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("manual")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    additionalNotes: "",
  })

//   const serviceId = searchParams.get("serviceId")
  const packageType = searchParams.get("package") || "basic"
  const notes = searchParams.get("notes") || ""

  // Mock service data - in real app, fetch based on serviceId
  const serviceData = {
    title: "تصميم شعار احترافي مع هوية بصرية كاملة",
    image:
      "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/403884315/original/c6bf2f6539934edd8a8c13a4d5b4ce9e3dfef512.jpg",
    packages: {
      basic: {
        name: "الباقة الأساسية",
        price: "5000",
        deliveryTime: "3 أيام",
        revisions: "2",
        features: ["تصميم شعار واحد", "3 مفاهيم أولية", "ملفات عالية الجودة", "تسليم بصيغة PNG و JPG"],
      },
      standard: {
        name: "الباقة المتوسطة",
        price: "8000",
        deliveryTime: "5 أيام",
        revisions: "4",
        features: [
          "تصميم شعار واحد",
          "5 مفاهيم أولية",
          "ملفات عالية الجودة",
          "تسليم بجميع الصيغ",
          "دليل استخدام الشعار",
        ],
      },
      premium: {
        name: "الباقة المتقدمة",
        price: "12000",
        deliveryTime: "7 أيام",
        revisions: "غير محدود",
        features: [
          "تصميم شعار واحد",
          "8 مفاهيم أولية",
          "ملفات عالية الجودة",
          "تسليم بجميع الصيغ",
          "دليل استخدام الشعار",
          "تصميم بطاقة أعمال",
          "ملف المصدر",
        ],
      },
    },
  }

  const selectedPackage = serviceData.packages[packageType as keyof typeof serviceData.packages]

  useEffect(() => {
    // Pre-fill form with user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false)
      router.push(
        `/checkout/success?orderId=${Date.now()}&serviceTitle=${encodeURIComponent(serviceData.title)}&package=${encodeURIComponent(selectedPackage.name)}&price=${selectedPackage.price}`,
      )
    }, 2000)
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="p-2 hover:bg-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>الخدمات</span>
                <span>/</span>
                <span>تصميم الشعارات</span>
                <span>/</span>
                <span className="gradient-brand-text font-medium">إتمام الطلب</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">إتمام الطلب</h1>
              <p className="text-gray-600">أكمل بياناتك لإتمام طلب الخدمة</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 mb-2 block">
                        الاسم الكامل *
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="h-12 border-gray-200 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                        البريد الإلكتروني *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="example@email.com"
                        className="h-12 border-gray-200 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">
                        رقم الهاتف *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+213 555 123 456"
                        className="h-12 border-gray-200 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700 mb-2 block">
                        المدينة
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="أدخل مدينتك"
                        className="h-12 border-gray-200 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700 mb-2 block">
                      العنوان
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="أدخل عنوانك الكامل"
                      className="border-gray-200 focus:border-purple-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes" className="text-sm font-semibold text-gray-700 mb-2 block">
                      ملاحظات إضافية
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                      placeholder="أي تفاصيل أو متطلبات إضافية..."
                      className="border-gray-200 focus:border-purple-500"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      {/* Manual Payment */}
                      <div className="gradient-border">
                        <div className="flex items-center space-x-2 space-x-reverse p-6">
                          <RadioGroupItem value="manual" id="manual" className="text-purple-600" />
                          <Label htmlFor="manual" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">دفع يدوي (تحويل بنكي)</p>
                                <p className="text-sm text-gray-600">قم بالتحويل وارفع إيصال الدفع</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>

                      {/* Credit Card */}
                      <div className="border border-gray-200 rounded-lg opacity-50">
                        <div className="flex items-center space-x-2 space-x-reverse p-6">
                          <RadioGroupItem value="card" id="card" disabled />
                          <Label htmlFor="card" className="flex-1 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">بطاقة ائتمان</p>
                                <p className="text-sm text-gray-600">قريباً...</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>

                      {/* Mobile Payment */}
                      <div className="border border-gray-200 rounded-lg opacity-50">
                        <div className="flex items-center space-x-2 space-x-reverse p-6">
                          <RadioGroupItem value="mobile" id="mobile" disabled />
                          <Label htmlFor="mobile" className="flex-1 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">الدفع عبر الهاتف</p>
                                <p className="text-sm text-gray-600">قريباً...</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "manual" && (
                    <div className="mt-8 gradient-border">
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-green-600" />
                          تفاصيل التحويل البنكي
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-4 rounded-lg">
                            <span className="font-semibold text-gray-700">اسم البنك:</span>
                            <p className="text-gray-900 mt-1">بنك الجزائر الخارجي</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <span className="font-semibold text-gray-700">رقم الحساب:</span>
                            <p className="text-gray-900 mt-1 font-mono">123456789012345</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <span className="font-semibold text-gray-700">اسم المستفيد:</span>
                            <p className="text-gray-900 mt-1">شركة الخدمات الرقمية</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg">
                            <span className="font-semibold text-gray-700">المبلغ:</span>
                            <p className="text-2xl font-bold gradient-brand-text mt-1">{selectedPackage.price} دج</p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Label htmlFor="receipt" className="block mb-3 font-semibold text-gray-700">
                            رفع إيصال الدفع *
                          </Label>
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-white hover:bg-purple-50 transition-colors">
                            <input
                              type="file"
                              id="receipt"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Label htmlFor="receipt" className="cursor-pointer">
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 text-purple-600" />
                              </div>
                              <p className="text-lg font-medium text-gray-900 mb-2">
                                {receiptFile ? receiptFile.name : "اضغط لرفع إيصال الدفع"}
                              </p>
                              <p className="text-sm text-gray-600">PNG, JPG, PDF (حد أقصى 5MB)</p>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white sticky top-8">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Service Image */}
                  <div className="relative">
                    <img
                      src={serviceData.image || "/placeholder.svg"}
                      alt={serviceData.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">{serviceData.title}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="gradient-bg text-white border-0">{selectedPackage.name}</Badge>
                    </div>

                    {/* Package Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">وقت التسليم:</span>
                        </div>
                        <span className="text-sm font-medium">{selectedPackage.deliveryTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">التعديلات:</span>
                        </div>
                        <span className="text-sm font-medium">{selectedPackage.revisions}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">المميزات المشمولة:</p>
                      <ul className="space-y-2">
                        {selectedPackage.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {notes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">ملاحظاتك:</p>
                      <p className="text-sm text-blue-800">{decodeURIComponent(notes)}</p>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-semibold text-gray-900">المجموع:</span>
                      <span className="text-3xl font-bold gradient-brand-text">{selectedPackage.price} دج</span>
                    </div>

                    <form onSubmit={handleSubmitOrder}>
                      <Button
                        type="submit"
                        className="w-full btn-gradient text-white h-14 text-lg font-semibold"
                        disabled={isProcessing || (paymentMethod === "manual" && !receiptFile)}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جاري المعالجة...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            تأكيد الطلب
                          </div>
                        )}
                      </Button>
                    </form>

                    <div className="text-center text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      معلوماتك محمية ومشفرة بأعلى معايير الأمان
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  )
}
