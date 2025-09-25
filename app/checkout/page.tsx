"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect  } from "react"
import { useRouter } from "next/navigation"
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
  CreditCard,
  Banknote,
  Check,
  Shield,
  Package,
  Clock,
  RefreshCw,
  Upload,
  Building2,
} from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [serviceData, setServiceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)

  const [buyerInfo, setBuyerInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  })
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Get URL parameters
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const serviceId = searchParams.get('serviceId') || ''
  const packageType = searchParams.get('package') || 'basic'
  const notes = searchParams.get('notes') || ''
  const serviceTitle = searchParams.get('serviceTitle') || ''
  const price = searchParams.get('price') || '0'
  const sellerId = searchParams.get('sellerId') || ''

  // Fetch service data
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/services/${serviceId}`)
        const data = await response.json()
        
        if (response.ok && data.service) {
          setServiceData(data.service)
        } else {
          // Fallback to mock data if API fails
          setServiceData({
            title: serviceTitle || "تصميم شعار احترافي مع هوية بصرية كاملة",
            primary_image: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/403884315/original/c6bf2f6539934edd8a8c13a4d5b4ce9e3dfef512.jpg",
            service_packages: [
              {
                id: "basic",
                name: "الباقة الأساسية",
                price: 5000,
                delivery_time: "3 أيام",
                revisions: "2",
                features: ["تصميم شعار واحد", "3 مفاهيم أولية", "ملفات عالية الجودة", "تسليم بصيغة PNG و JPG"],
              },
              {
                id: "standard", 
                name: "الباقة المتوسطة",
                price: 8000,
                delivery_time: "5 أيام",
                revisions: "4",
                features: ["تصميم شعار واحد", "5 مفاهيم أولية", "ملفات عالية الجودة", "تسليم بجميع الصيغ", "دليل استخدام الشعار"],
              },
              {
                id: "premium",
                name: "الباقة المتقدمة", 
                price: 12000,
                delivery_time: "7 أيام",
                revisions: "غير محدود",
                features: ["تصميم شعار واحد", "8 مفاهيم أولية", "ملفات عالية الجودة", "تسليم بجميع الصيغ", "دليل استخدام الشعار", "تصميم بطاقة أعمال", "ملف المصدر"],
              }
            ]
          })
        }
      } catch (error) {
        console.error('Error fetching service data:', error)
        // Use fallback data
        setServiceData({
          title: serviceTitle || "تصميم شعار احترافي مع هوية بصرية كاملة",
          primary_image: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/403884315/original/c6bf2f6539934edd8a8c13a4d5b4ce9e3dfef512.jpg",
          service_packages: [
            {
              id: "basic",
              name: "الباقة الأساسية",
              price: 5000,
              delivery_time: "3 أيام",
              revisions: "2",
              features: ["تصميم شعار واحد", "3 مفاهيم أولية", "ملفات عالية الجودة", "تسليم بصيغة PNG و JPG"],
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServiceData()
  }, [serviceId, serviceTitle])

  // Find selected package
  const selectedPackage = serviceData?.service_packages?.find((pkg: any) => 
    pkg.name === packageType || pkg.id === packageType
  ) || serviceData?.service_packages?.[0]

  useEffect(() => {
    // Pre-fill buyer info from user profile
    const prefillBuyerInfo = async () => {
      try {
        const response = await fetch("/api/profile/me", {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user && data.profile) {
            setBuyerInfo({
              fullName: data.profile.display_name || data.user.email.split('@')[0] || "",
              email: data.user.email || "",
              phone: data.profile.phone || "",
              address: data.profile.location || "",
            })
            return
          }
        }
      } catch (error) {
        console.log("Could not fetch user data from API, trying localStorage")
      }

      // Fallback to localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        setBuyerInfo({
          fullName: user.name || user.email?.split('@')[0] || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        })
      }
    }

    prefillBuyerInfo()
  }, [])

  const handleNotesChange = (value: string) => {
    setAdditionalNotes(value)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('يرجى رفع ملف صورة (JPG, PNG, WebP, AVIF) أو PDF فقط')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      
      setPaymentProof(file)
    }
  }


  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Validate payment proof for methods that require it
      if ((paymentMethod === "bank_transfer" || paymentMethod === "card_payment") && !paymentProof) {
        alert("يرجى رفع إيصال الدفع")
        setIsProcessing(false)
        return
      }

      // Prepare form data for API
      const orderFormData = new FormData()
      orderFormData.append("service_id", serviceId || "")
      orderFormData.append("package_id", selectedPackage?.id || "")
      orderFormData.append("seller_id", sellerId || "")
      orderFormData.append("amount", (selectedPackage?.price || price).toString())
      orderFormData.append("payment_method", paymentMethod)
      orderFormData.append("additional_notes", additionalNotes)
      
      // Add payment proof if provided
      if (paymentProof) {
        orderFormData.append("payment_proof", paymentProof)
      }

      // Create order in database
      const response = await fetch("/api/orders", {
        method: "POST",
        body: orderFormData,
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "فشل في إنشاء الطلب")
      }

      // Log order creation on server
      console.log("Order created successfully:", {
        orderId: result.order.id,
        serviceId: serviceId,
        buyerId: result.order.buyer_id,
        sellerId: result.order.seller_id,
        amount: result.order.amount,
        status: result.order.status,
        timestamp: new Date().toISOString()
      })

      // Redirect to success page with real order data
      router.push(
        `/checkout/success?orderId=${result.order.id}&serviceTitle=${encodeURIComponent(serviceData?.title || serviceTitle)}&package=${encodeURIComponent(selectedPackage?.name || '')}&price=${selectedPackage?.price || price}`
      )

    } catch (error) {
      console.error("Order creation error:", error)
      alert(error instanceof Error ? error.message : "حدث خطأ في إنشاء الطلب")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    )
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">لا يمكن العثور على بيانات الخدمة</p>
        </div>
      </div>
    )
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
                  {/* Buyer Information - Read Only */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      معلومات المشتري
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">الاسم الكامل</Label>
                        <p className="text-gray-900 font-medium mt-1">{buyerInfo.fullName || "غير محدد"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">البريد الإلكتروني</Label>
                        <p className="text-gray-900 font-medium mt-1">{buyerInfo.email || "غير محدد"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">رقم الهاتف</Label>
                        <p className="text-gray-900 font-medium mt-1">{buyerInfo.phone || "غير محدد"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">العنوان</Label>
                        <p className="text-gray-900 font-medium mt-1">{buyerInfo.address || "غير محدد"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      <Shield className="w-4 h-4 inline mr-1" />
                      هذه المعلومات مأخوذة من ملفك الشخصي. لتعديلها، يرجى الذهاب إلى 
                      <button 
                        onClick={() => router.push('/dashboard/profile')}
                        className="text-purple-600 hover:text-purple-700 underline mx-1 cursor-pointer"
                      >
                        إعدادات الملف الشخصي
                      </button>
                    </p>
                  </div>

                  {/* Additional Notes - Editable */}
                  <div>
                    <Label htmlFor="additionalNotes" className="text-sm font-semibold text-gray-700 mb-2 block">
                      ملاحظات إضافية
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      value={additionalNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="أي تفاصيل أو متطلبات إضافية..."
                      className="border-gray-200 focus:border-purple-500"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="gradient-bg text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-6">
                      {/* Bank Transfer */}
                      <div className={`transition-all duration-300 ${
                        paymentMethod === "bank_transfer" 
                          ? "gradient-border bg-gradient-to-r from-blue-50 to-purple-50" 
                          : "border border-gray-200 hover:border-blue-300"
                      } rounded-xl`}>
                        <div className="p-8">
                          <Label htmlFor="bank_transfer" className="cursor-pointer block">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-8 h-8 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-gray-900">تحويل بنكي</h3>
                                  {paymentMethod === "bank_transfer" && (
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                                  <span className="hidden sm:inline">قم بالتحويل وارفع إيصال الدفع</span>
                                  <span className="sm:hidden">تحويل + إيصال</span>
                                </p>
                              </div>
                            </div>
                          </Label>
                          <RadioGroupItem value="bank_transfer" id="bank_transfer" className="sr-only" />
                        </div>
                      </div>

                      {/* Card Payment */}
                      <div className={`transition-all duration-300 ${
                        paymentMethod === "card_payment" 
                          ? "gradient-border bg-gradient-to-r from-green-50 to-emerald-50" 
                          : "border border-gray-200 hover:border-green-300"
                      } rounded-xl`}>
                        <div className="p-8">
                          <Label htmlFor="card_payment" className="cursor-pointer block">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-8 h-8 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-gray-900">دفع بالبطاقة</h3>
                                  {paymentMethod === "card_payment" && (
                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                                  <span className="hidden sm:inline">ارفع إيصال الدفع بالبطاقة</span>
                                  <span className="sm:hidden">بطاقة + إيصال</span>
                                </p>
                              </div>
                            </div>
                          </Label>
                          <RadioGroupItem value="card_payment" id="card_payment" className="sr-only" />
                        </div>
                      </div>

                      {/* Cash Payment */}
                      <div className={`transition-all duration-300 ${
                        paymentMethod === "cash" 
                          ? "gradient-border bg-gradient-to-r from-orange-50 to-yellow-50" 
                          : "border border-gray-200 hover:border-orange-300"
                      } rounded-xl`}>
                        <div className="p-8">
                          <Label htmlFor="cash" className="cursor-pointer block">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Banknote className="w-8 h-8 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-gray-900">دفع نقدي</h3>
                                  {paymentMethod === "cash" && (
                                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                                  <span className="hidden sm:inline">ادفع نقداً عند التسليم</span>
                                  <span className="sm:hidden">نقد عند التسليم</span>
                                </p>
                              </div>
                            </div>
                          </Label>
                          <RadioGroupItem value="cash" id="cash" className="sr-only" />
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Payment Details */}
                  {(paymentMethod === "bank_transfer" || paymentMethod === "card_payment") && (
                    <div className="mt-8 gradient-border">
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-blue-600" />
                          {paymentMethod === "bank_transfer" ? "تفاصيل التحويل البنكي" : "تفاصيل الدفع بالبطاقة"}
                        </h4>
                        
                        {paymentMethod === "bank_transfer" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
                            <div className="bg-white p-4 rounded-lg">
                              <span className="font-semibold text-gray-700 text-xs sm:text-sm">اسم البنك:</span>
                              <p className="text-gray-900 mt-1 text-sm sm:text-base">بنك الجزائر الخارجي</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <span className="font-semibold text-gray-700 text-xs sm:text-sm">رقم الحساب:</span>
                              <p className="text-gray-900 mt-1 font-mono text-xs sm:text-sm break-all">123456789012345</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <span className="font-semibold text-gray-700 text-xs sm:text-sm">اسم المستفيد:</span>
                              <p className="text-gray-900 mt-1 text-sm sm:text-base">شركة الخدمات الرقمية</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <span className="font-semibold text-gray-700 text-xs sm:text-sm">المبلغ:</span>
                              <p className="text-xl sm:text-2xl font-bold gradient-brand-text mt-1">{selectedPackage?.price || price} دج</p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "card_payment" && (
                          <div className="bg-white p-4 rounded-lg mb-6">
                            <p className="text-sm sm:text-base text-gray-700 mb-3">
                              <strong>قم بالدفع عبر البطاقة وارفع إيصال الدفع</strong>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className="hidden sm:inline">يمكنك الدفع عبر أي بطاقة ائتمان أو خصم مدعومة في بلدك. تأكد من إرفاق إيصال الدفع الصحيح.</span>
                              <span className="sm:hidden">أي بطاقة ائتمان أو خصم + إيصال الدفع</span>
                            </p>
                          </div>
                        )}

                        <div className="mt-6">
                          <Label htmlFor="payment_proof" className="block mb-4 font-semibold text-gray-700 text-lg">
                            رفع إيصال الدفع *
                          </Label>
                          <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 sm:p-8 text-center bg-white hover:bg-purple-50 transition-colors">
                            <input
                              type="file"
                              id="payment_proof"
                              accept="image/*,.pdf,.avif"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Label htmlFor="payment_proof" className="cursor-pointer block">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                              </div>
                              <p className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
                                {paymentProof ? (
                                  <span className="truncate block max-w-xs mx-auto">
                                    {paymentProof.name}
                                  </span>
                                ) : (
                                  <span className="hidden sm:inline">اضغط لرفع إيصال الدفع</span>
                                )}
                                {!paymentProof && (
                                  <span className="sm:hidden">رفع الإيصال</span>
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                <span className="hidden sm:inline">PNG, JPG, WebP, PDF (حد أقصى 5MB)</span>
                                <span className="sm:hidden">صور أو PDF (5MB)</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                <span className="hidden sm:inline">💡 الصور ستتم تحسينها تلقائياً، PDFs تبقى كما هي</span>
                                <span className="sm:hidden">💡 تحسين الصور</span>
                              </p>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash" && (
                    <div className="mt-8 gradient-border">
                      <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                          <Banknote className="w-5 h-5 text-orange-600" />
                          تفاصيل الدفع النقدي
                        </h4>
                        <div className="bg-white p-4 sm:p-6 rounded-lg">
                          <p className="text-sm sm:text-base text-gray-700 mb-3">
                            <strong>سيتم التواصل معك لتحديد موعد التسليم</strong>
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="hidden sm:inline">سيقوم مقدم الخدمة بالتواصل معك خلال 24 ساعة لتحديد موعد مناسب لتسليم الخدمة. يمكنك الدفع نقداً عند استلام الخدمة.</span>
                            <span className="sm:hidden">تواصل خلال 24 ساعة + دفع نقدي عند التسليم</span>
                          </p>
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
                      src={serviceData.primary_image || "/placeholder.svg"}
                      alt={serviceData.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">{serviceData.title}</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="gradient-bg text-white border-0">{selectedPackage?.name || 'الباقة المختارة'}</Badge>
                    </div>

                    {/* Package Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">وقت التسليم:</span>
                        </div>
                        <span className="text-sm font-medium">{selectedPackage?.delivery_time || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">التعديلات:</span>
                        </div>
                        <span className="text-sm font-medium">{selectedPackage?.revisions || 'غير محدد'}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">المميزات المشمولة:</p>
                      <ul className="space-y-2">
                        {selectedPackage?.features?.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        )) || (
                          <li className="text-sm text-gray-500">لا توجد مميزات محددة</li>
                        )}
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
                      <span className="text-3xl font-bold gradient-brand-text">{selectedPackage?.price || price} دج</span>
                    </div>

                    <form onSubmit={handleSubmitOrder}>
                      <Button
                        type="submit"
                        className="w-full btn-gradient text-white h-14 text-lg font-semibold"
                        disabled={isProcessing || ((paymentMethod === "bank_transfer" || paymentMethod === "card_payment") && !paymentProof)}
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

