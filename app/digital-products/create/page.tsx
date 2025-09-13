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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import {
  Upload,
  X,
  Plus,
  ArrowRight,
  Save,
  ImageIcon,
  HelpCircle,
  Download,
  Smartphone,
  Monitor,
  Gamepad2,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface DigitalProductPackage {
  name: string
  price: string
  duration: string
  users: string
  features: string[]
}

interface FAQ {
  question: string
  answer: string
}

function CreateDigitalProductForm() {
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
    platforms: [] as string[],
    systemRequirements: {
      web: "",
      mobile: "",
      desktop: "",
    },
    packages: [
      {
        name: "الباقة الأساسية",
        price: "",
        duration: "",
        users: "",
        features: [""],
      },
    ] as DigitalProductPackage[],
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
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const mainImageInputRef = useRef<HTMLInputElement | null>(null)
  const additionalImagesInputRef = useRef<HTMLInputElement | null>(null)

  const categories = [
    { value: "subscriptions", label: "اشتراكات" },
    { value: "gaming", label: "ألعاب" },
    { value: "software", label: "برمجيات" },
    { value: "entertainment", label: "ترفيه" },
    { value: "education", label: "تعليم" },
    { value: "productivity", label: "إنتاجية" },
    { value: "design", label: "تصميم" },
  ]

  const availablePlatforms = [
    "التلفزيون الذكي",
    "الجوال",
    "الكمبيوتر",
    "التابلت",
    "PlayStation",
    "Xbox",
    "Nintendo Switch",
    "متصفح الويب",
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateSystemRequirement = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      systemRequirements: {
        ...prev.systemRequirements,
        [platform]: value,
      },
    }))
  }

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const updatePackage = (packageIndex: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, index) => (index === packageIndex ? { ...pkg, [field]: value } : pkg)),
    }))
  }

  const addPackage = () => {
    const newPackage: DigitalProductPackage = {
      name: `باقة مخصصة ${formData.packages.length + 1}`,
      price: "",
      duration: "",
      users: "",
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
    console.log("[input] handleMainImageChange fired")
    const file = e.target.files?.[0]
    if (!file) return
    setError("")
    setIsUploading(true)
    try {
      console.log("[upload] main: start")
      const fd = new FormData()
      fd.append("files", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      console.log("[upload] main: status", res.status)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "فشل رفع الصورة الرئيسية")
      }
      const data = await res.json()
      console.log("[upload] main: response", data)
      const url: string | undefined = data?.files?.[0]?.url
      if (!url) throw new Error("لم يتم استلام رابط الصورة")
      setFormData((prev) => ({ ...prev, mainImageUrl: url, mainImage: null }))
    } catch (err: any) {
      setError(err?.message || "تعذر رفع الصورة الرئيسية")
    } finally {
      setIsUploading(false)
      e.currentTarget.value = ""
    }
  }

  const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[input] handleAdditionalImagesChange fired")
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setError("")
    setIsUploading(true)
    try {
      console.log("[upload] gallery: start", { count: files.length })
      const fd = new FormData()
      files.forEach((f) => fd.append("files", f))
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      console.log("[upload] gallery: status", res.status)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "فشل رفع الصور الإضافية")
      }
      const data = await res.json()
      console.log("[upload] gallery: response", data)
      const newUrls: string[] = (data?.files || []).map((f: any) => f.url)
      setFormData((prev) => ({
        ...prev,
        additionalImageUrls: [...prev.additionalImageUrls, ...newUrls].slice(0, 5),
        additionalImages: [],
      }))
    } catch (err: any) {
      setError(err?.message || "تعذر رفع الصور الإضافية")
    } finally {
      setIsUploading(false)
      e.currentTarget.value = ""
    }
  }

  const removeAdditionalImage = (imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImageUrls: prev.additionalImageUrls.filter((_, index) => index !== imageIndex),
    }))
  }

  const uploadImages = async (): Promise<{ mainImageUrl: string | null; additionalImageUrls: string[] }> => {
    // Images are uploaded on selection. Just return current URLs.
    return { mainImageUrl: formData.mainImageUrl, additionalImageUrls: formData.additionalImageUrls }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.title || !formData.description || !formData.category) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setIsLoading(false)
      return
    }

    if (!formData.packages[0].price || !formData.packages[0].duration) {
      setError("يجب ملء بيانات الباقة الأساسية على الأقل")
      setIsLoading(false)
      return
    }

    if (!formData.mainImageUrl) {
      setError("يرجى رفع الصورة الرئيسية أولاً")
      setIsLoading(false)
      return
    }

    console.log("[create] payload preview:", {
      basicInfo: {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        platforms: formData.platforms,
      },
      images: {
        mainImage: formData.mainImageUrl,
        additionalImages: formData.additionalImageUrls,
        totalImages: (formData.mainImageUrl ? 1 : 0) + formData.additionalImageUrls.length,
      },
      systemRequirements: formData.systemRequirements,
      packages: formData.packages.map((pkg, index) => ({
        packageNumber: index + 1,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        users: pkg.users,
        features: pkg.features.filter((f) => f.trim() !== ""),
      })),
      faqs: formData.faqs.filter((faq) => faq.question.trim() !== "" && faq.answer.trim() !== ""),
      totalPackages: formData.packages.length,
      totalFAQs: formData.faqs.filter((faq) => faq.question.trim() !== "" && faq.answer.trim() !== "").length,
    })

    try {
      const { mainImageUrl, additionalImageUrls } = await uploadImages()

      const packagesClean = formData.packages.map((pkg) => ({
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        users: pkg.users,
        features: pkg.features.filter((f) => f.trim() !== ""),
      }))
      const faqsClean = formData.faqs
        .filter((f) => f.question.trim() && f.answer.trim())
        .map((f) => ({ question: f.question, answer: f.answer }))

      const images = {
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls,
        totalImages: (mainImageUrl ? 1 : 0) + additionalImageUrls.length,
      }

      const { data: session } = await supabase.auth.getSession()
      const profileId = session.session?.user?.id || null

      const { error: insertError } = await supabase.from("services").insert({
        profile_id: profileId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        images,
        packages: packagesClean,
        faqs: faqsClean,
        total_packages: packagesClean.length,
        total_faqs: faqsClean.length,
      })

      if (insertError) throw new Error(insertError.message)

      setIsSuccessOpen(true)
    } catch (error: any) {
      setError(error?.message || "حدث خطأ أثناء إنشاء المنتج الرقمي")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-brand-text bg-clip-text text-transparent mb-2">
              إضافة منتج رقمي جديد
            </h1>
            <p className="text-gray-600">أنشئ منتجك الرقمي وابدأ في استقبال الطلبات</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    اسم المنتج الرقمي *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="مثال: اشتراك نتفليكس - شهر واحد"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    وصف المنتج *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="اكتب وصفاً مفصلاً عن منتجك الرقمي..."
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
                      <SelectValue placeholder="اختر فئة المنتج" />
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

            {/* Images */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                  صور المنتج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        <p className="text-sm text-gray-600 truncate">{formData.mainImageUrl}</p>
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
                          console.log("[ui] dropzone main clicked")
                          mainImageInputRef.current?.click()
                        }}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">اختر الصورة الرئيسية للمنتج</p>
                        <p className="text-sm text-gray-500">PNG, JPG حتى 10MB</p>
                        <input
                          ref={mainImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          onInput={handleMainImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 bg-transparent"
                          disabled={isUploading}
                          onClick={() => {
                            console.log("[ui] main trigger clicked")
                            mainImageInputRef.current?.click()
                          }}
                        >
                          {isUploading ? "جاري الرفع..." : "اختر الصورة الرئيسية"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

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
                        onInput={handleAdditionalImagesChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("[ui] gallery trigger clicked")
                          additionalImagesInputRef.current?.click()
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        إضافة صور
                      </Button>
                    </div>

                    {formData.additionalImageUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.additionalImageUrls.map((imageUrl, index) => (
                          <div key={index} className="relative border rounded-lg p-2">
                            <div className="w-full h-24 bg-gray-100 rounded overflow-hidden mb-2">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Additional image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-600 truncate">{imageUrl}</p>
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

            {/* Platform Support */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-green-600" />
                  المنصات المدعومة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">اختر المنصات التي يدعمها المنتج</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availablePlatforms.map((platform) => (
                      <div
                        key={platform}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.platforms.includes(platform)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => togglePlatform(platform)}
                      >
                        <div className="flex items-center gap-2">
                          {platform.includes("الجوال") && <Smartphone className="w-4 h-4" />}
                          {platform.includes("الكمبيوتر") && <Monitor className="w-4 h-4" />}
                          {(platform.includes("PlayStation") || platform.includes("Xbox")) && (
                            <Gamepad2 className="w-4 h-4" />
                          )}
                          <span className="text-sm">{platform}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">متطلبات النظام</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">متصفح الويب</Label>
                      <Textarea
                        value={formData.systemRequirements.web}
                        onChange={(e) => updateSystemRequirement("web", e.target.value)}
                        placeholder="متصفح حديث، اتصال إنترنت 5 ميجا"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">تطبيق الجوال</Label>
                      <Textarea
                        value={formData.systemRequirements.mobile}
                        onChange={(e) => updateSystemRequirement("mobile", e.target.value)}
                        placeholder="iOS 12+ أو Android 5+"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">سطح المكتب</Label>
                      <Textarea
                        value={formData.systemRequirements.desktop}
                        onChange={(e) => updateSystemRequirement("desktop", e.target.value)}
                        placeholder="Windows 10+ أو macOS 10.10+"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Packages */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  باقات المنتج
                  <Button type="button" onClick={addPackage} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة باقة
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.packages.map((packageData, packageIndex) => (
                    <div
                      key={packageIndex}
                      className="border rounded-lg p-6 relative bg-gray-50"
                    >
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
                            onChange={(e) => updatePackage(packageIndex, "name", e.target.value)}
                            placeholder="مثال: اشتراك 3 أشهر"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm">السعر (دج) *</Label>
                            <Input
                              value={packageData.price}
                              onChange={(e) => updatePackage(packageIndex, "price", e.target.value)}
                              placeholder="1500"
                              type="number"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">المدة *</Label>
                            <Input
                              value={packageData.duration}
                              onChange={(e) => updatePackage(packageIndex, "duration", e.target.value)}
                              placeholder="شهر واحد"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">عدد المستخدمين</Label>
                            <Input
                              value={packageData.users}
                              onChange={(e) => updatePackage(packageIndex, "users", e.target.value)}
                              placeholder="حساب واحد"
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
                                  placeholder="مميزة المنتج"
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

            {/* FAQ */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-600" />
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
                            placeholder="مثال: كم من الوقت يستغرق تفعيل الاشتراك؟"
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
                {isLoading ? "جاري النشر..." : "نشر المنتج"}
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </form>
          <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تم إنشاء الخدمة بنجاح</DialogTitle>
                <DialogDescription>يمكنك الرجوع للوحة التحكم أو إضافة خدمة أخرى.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // reset form for another entry
                    setFormData({
                      title: "",
                      description: "",
                      category: "",
                      tags: [],
                      mainImage: null,
                      additionalImages: [],
                      mainImageUrl: null,
                      additionalImageUrls: [],
                      platforms: [],
                      systemRequirements: { web: "", mobile: "", desktop: "" },
                      packages: [
                        { name: "الباقة الأساسية", price: "", duration: "", users: "", features: [""] },
                      ],
                      faqs: [{ question: "", answer: "" }],
                    })
                    setIsSuccessOpen(false)
                  }}
                >
                  إضافة خدمة أخرى
                </Button>
                <Button type="button" onClick={() => router.push("/dashboard")}>الذهاب للوحة التحكم</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CreateDigitalProductPage() {
  return (
    <ProtectedRoute requiredUserType="seller">
      <CreateDigitalProductForm />
    </ProtectedRoute>
  )
}
