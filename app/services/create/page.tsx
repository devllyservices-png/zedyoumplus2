/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Plus, ArrowRight, Save, ImageIcon, HelpCircle, CheckCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
interface ServicePackage {
  name: string
  price: string
  deliveryTime: string
  revisions: string
  features: string[]
}

interface FAQ {
  question: string
  answer: string
}

function CreateServiceForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    mainImage: null as File | null,
    additionalImages: [] as File[],
    mainImageUrl: null as string | null,
    additionalImageUrls: [] as string[],
    packages: [
      {
        name: "الباقة الأساسية",
        price: "",
        deliveryTime: "",
        revisions: "",
        features: [""],
      },
    ] as ServicePackage[],
    faqs: [
      {
        question: "",
        answer: "",
      },
    ] as FAQ[],
  })
  const [currentTag, setCurrentTag] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Debug popup state changes
  useEffect(() => {
    console.log("Popup state changed:", showSuccessPopup)
  }, [showSuccessPopup])
  const [isUploading, setIsUploading] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement | null>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement | null>(null)

  const categories = [
    { value: "design", label: "التصميم والجرافيك" },
    { value: "programming", label: "البرمجة والتطوير" },
    { value: "marketing", label: "التسويق الرقمي" },
    { value: "writing", label: "الكتابة والترجمة" },
    { value: "video", label: "المونتاج والفيديو" },
    { value: "business", label: "الأعمال والاستشارات" },
    { value: "music", label: "الموسيقى والصوتيات" },
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updatePackage = (packageIndex: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, index) => (index === packageIndex ? { ...pkg, [field]: value } : pkg)),
    }))
  }

  const addPackage = () => {
    const newPackage: ServicePackage = {
      name: `باقة مخصصة ${formData.packages.length + 1}`,
      price: "",
      deliveryTime: "",
      revisions: "",
      features: [""],
    }
    setFormData((prev) => ({
      ...prev,
      packages: [...prev.packages, newPackage],
    }))
  }

  const removePackage = (packageIndex: number) => {
    if (formData.packages.length > 1) {
      setFormData((prev) => ({
        ...prev,
        packages: prev.packages.filter((_, index) => index !== packageIndex),
      }))
    }
  }

  const updatePackageName = (packageIndex: number, name: string) => {
    updatePackage(packageIndex, "name", name)
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData("tags", [...formData.tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const addFeature = (packageIndex: number) => {
    const currentFeatures = formData.packages[packageIndex].features
    updatePackage(packageIndex, "features", [...currentFeatures, ""])
  }

  const updateFeature = (packageIndex: number, featureIndex: number, value: string) => {
    const currentFeatures = [...formData.packages[packageIndex].features]
    currentFeatures[featureIndex] = value
    updatePackage(packageIndex, "features", currentFeatures)
  }

  const removeFeature = (packageIndex: number, featureIndex: number) => {
    const currentFeatures = formData.packages[packageIndex].features
    if (currentFeatures.length > 1) {
      updatePackage(
        packageIndex,
        "features",
        currentFeatures.filter((_, i) => i !== featureIndex),
      )
    }
  }

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }))
  }

  const updateFAQ = (faqIndex: number, field: "question" | "answer", value: string) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, index) => (index === faqIndex ? { ...faq, [field]: value } : faq)),
    }))
  }

  const removeFAQ = (faqIndex: number) => {
    if (formData.faqs.length > 1) {
      setFormData((prev) => ({
        ...prev,
        faqs: prev.faqs.filter((_, index) => index !== faqIndex),
      }))
    }
  }

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      console.log("[services] main upload skipped: already uploading")
      return
    }
    console.log("[services] handleMainImageChange fired")
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("files", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      console.log("[services] main upload status", res.status)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "فشل رفع الصورة الرئيسية")
      }
      const data = await res.json()
      console.log("[services] main upload response", data)
      const url: string | undefined = data?.files?.[0]?.url
      if (!url) throw new Error("لم يتم استلام رابط الصورة")
      setFormData((prev) => ({ ...prev, mainImageUrl: url, mainImage: null }))
    } catch (err: any) {
      setError(err?.message || "تعذر رفع الصورة الرئيسية")
    } finally {
      setIsUploading(false)
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = ""
      }
    }
  }

  const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) {
      console.log("[services] gallery upload skipped: already uploading")
      return
    }
    console.log("[services] handleAdditionalImagesChange fired")
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setError("")
    setIsUploading(true)
    try {
      const fd = new FormData()
      files.forEach((f) => fd.append("files", f))
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      console.log("[services] gallery upload status", res.status)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "فشل رفع الصور الإضافية")
      }
      const data = await res.json()
      console.log("[services] gallery upload response", data)
      const urls: string[] = (data?.files || []).map((f: any) => f.url)
      setFormData((prev) => ({
        ...prev,
        additionalImageUrls: [...prev.additionalImageUrls, ...urls].slice(0, 5),
        additionalImages: [],
      }))
    } catch (err: any) {
      setError(err?.message || "تعذر رفع الصور الإضافية")
    } finally {
      setIsUploading(false)
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = ""
      }
    }
  }

  const removeAdditionalImage = (imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImageUrls: prev.additionalImageUrls.filter((_, index) => index !== imageIndex),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setIsLoading(false)
      return
    }

    if (!formData.packages[0].price || !formData.packages[0].deliveryTime) {
      setError("يجب ملء بيانات الباقة الأساسية على الأقل")
      setIsLoading(false)
      return
    }

    if (!formData.mainImageUrl) {
      setError("يرجى رفع الصورة الرئيسية أولاً")
      setIsLoading(false)
      return
    }

   const serviceData = {
  title: formData.title,
  description: formData.description,
  category: formData.category,
  tags: formData.tags,
  packages: formData.packages.map((pkg) => ({
    name: pkg.name,
    price: parseFloat(pkg.price) || 0,
    delivery_time: pkg.deliveryTime,
    revisions: pkg.revisions,
    features: pkg.features.filter((f) => f.trim() !== ""),
  })),
  faq: formData.faqs.filter(
    (faq) => faq.question.trim() !== "" && faq.answer.trim() !== ""
  ),
  images: [
    ...(formData.mainImageUrl ? [{ url: formData.mainImageUrl }] : []),
    ...formData.additionalImageUrls.map(url => ({ url }))
  ]
};


    try {
      console.log("Creating service with data:", serviceData)
      
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(serviceData),
      })

      const result = await response.json()
      console.log("Service creation response:", { status: response.status, result })
      
      if (response.ok) {
        console.log("Service created successfully, showing popup")
        setShowSuccessPopup(true)
        console.log("Popup state set to true")
      } else {
        console.error("Service creation failed:", result.error)
        setError(result.error || "حدث خطأ أثناء إنشاء الخدمة")
      }
      
    } catch (error) {
      console.error("Service creation error:", error)
      setError("حدث خطأ أثناء إنشاء الخدمة")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessOk = () => {
    console.log("Success OK clicked, redirecting to dashboard")
    setShowSuccessPopup(false)
    setTimeout(() => {
      router.push("/dashboard")
    }, 100)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
        {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">تم إنشاء الخدمة بنجاح!</h3>
            <p className="text-gray-600 mb-6">تم حفظ خدمتك ويمكنك الآن استقبال الطلبات</p>
            <Button onClick={handleSuccessOk} className="w-full btn-gradient text-white">
              <ArrowRight className="w-4 h-4 ml-2" />
              الذهاب إلى لوحة التحكم
            </Button>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">إضافة خدمة جديدة</h1>
            <p className="text-gray-600 text-sm sm:text-base">أنشئ خدمتك وابدأ في استقبال الطلبات</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    عنوان الخدمة *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="مثال: تصميم شعار احترافي مع هوية بصرية كاملة"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    وصف الخدمة *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً عن خدمتك..."
                    rows={5}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    الفئة *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر فئة الخدمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">الكلمات المفتاحية</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="أضف كلمة مفتاحية"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <ImageIcon className="w-5 h-5" />
                  صور الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Image */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">الصورة الرئيسية *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.mainImageUrl ? (
                      <div className="space-y-2">
                        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={formData.mainImageUrl || "/placeholder.svg"}
                            alt="Main preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* hide URL */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData((prev) => ({ ...prev, mainImageUrl: null }))}
                        >
                          إزالة
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          console.log("[services] main dropzone clicked")
                          mainImageInputRef.current?.click()
                        }}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">اختر الصورة الرئيسية للخدمة</p>
                        <p className="text-sm text-gray-500">PNG, JPG حتى 10MB</p>
                        <input
                          ref={mainImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 bg-transparent"
                          disabled={isUploading}
                          onClick={() => {
                            console.log("[services] main trigger clicked")
                            mainImageInputRef.current?.click()
                          }}
                        >
                          {isUploading ? "جاري الرفع..." : "اختر الصورة الرئيسية"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">صور إضافية (اختيارية)</Label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-2">أضف صور إضافية (حتى 5 صور)</p>
                      <input
                        ref={additionalImagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("[services] gallery trigger clicked")
                          additionalImagesInputRef.current?.click()
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة صور
                      </Button>
                    </div>

                    {formData.additionalImageUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.additionalImageUrls.map((url, index) => (
                          <div key={index} className="relative border rounded-lg p-2">
                            <div className="w-full h-24 bg-gray-100 rounded overflow-hidden mb-2">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Additional image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-600 truncate">{url}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-50 hover:bg-red-100"
                              onClick={() => removeAdditionalImage(index)}
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  باقات الخدمة
                  <Button type="button" onClick={addPackage} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة باقة
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.packages.map((packageData, packageIndex) => (
                    <div key={packageIndex} className="border rounded-lg p-6 relative">
                      {formData.packages.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 left-2 w-8 h-8 p-0 bg-transparent"
                          onClick={() => removePackage(packageIndex)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">اسم الباقة</Label>
                          <Input
                            value={packageData.name}
                            onChange={(e) => updatePackageName(packageIndex, e.target.value)}
                            placeholder="مثال: الباقة الذهبية"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm">السعر (دج) *</Label>
                            <Input
                              value={packageData.price}
                              onChange={(e) => updatePackage(packageIndex, "price", e.target.value)}
                              placeholder="5000"
                              type="number"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">وقت التسليم *</Label>
                            <Input
                              value={packageData.deliveryTime}
                              onChange={(e) => updatePackage(packageIndex, "deliveryTime", e.target.value)}
                              placeholder="3 أيام"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">عدد التعديلات</Label>
                            <Input
                              value={packageData.revisions}
                              onChange={(e) => updatePackage(packageIndex, "revisions", e.target.value)}
                              placeholder="2"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">مميزات الباقة</Label>
                          <div className="space-y-2 mt-2">
                            {packageData.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex gap-2">
                                <Input
                                  value={feature}
                                  onChange={(e) => updateFeature(packageIndex, featureIndex, e.target.value)}
                                  placeholder="مميزة الخدمة"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFeature(packageIndex, featureIndex)}
                                  disabled={packageData.features.length === 1}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addFeature(packageIndex)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              إضافة مميزة
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    الأسئلة الشائعة
                  </div>
                  <Button type="button" onClick={addFAQ} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة سؤال
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.faqs.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border rounded-lg p-4 relative">
                      {formData.faqs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 left-2 w-8 h-8 p-0 bg-transparent"
                          onClick={() => removeFAQ(faqIndex)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">السؤال</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => updateFAQ(faqIndex, "question", e.target.value)}
                            placeholder="مثال: كم يستغرق تسليم التصميم؟"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">الإجابة</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(faqIndex, "answer", e.target.value)}
                            placeholder="اكتب الإجابة التفصيلية هنا..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="button" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                حفظ كمسودة
              </Button>
              <Button type="submit" disabled={isLoading || isUploading} className="btn-gradient text-white">
                {isLoading ? "جاري النشر..." : "نشر الخدمة"}
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
              
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CreateServicePage() {
  return (
    <ProtectedRoute requiredUserType="seller">
      <CreateServiceForm />
    </ProtectedRoute>
  )
}
