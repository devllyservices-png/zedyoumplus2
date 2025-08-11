"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Plus, ArrowRight, Save } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

function CreateServiceForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    images: [] as string[],
    packages: {
      basic: {
        name: "الباقة الأساسية",
        price: "",
        deliveryTime: "",
        revisions: "",
        features: [""],
      },
      standard: {
        name: "الباقة المتوسطة",
        price: "",
        deliveryTime: "",
        revisions: "",
        features: [""],
      },
      premium: {
        name: "الباقة المتقدمة",
        price: "",
        deliveryTime: "",
        revisions: "",
        features: [""],
      },
    },
  })
  const [currentTag, setCurrentTag] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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

  const updatePackage = (packageType: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageType]: {
          ...prev.packages[packageType as keyof typeof prev.packages],
          [field]: value,
        },
      },
    }))
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

  const addFeature = (packageType: string) => {
    const currentFeatures = formData.packages[packageType as keyof typeof formData.packages].features
    updatePackage(packageType, "features", [...currentFeatures, ""])
  }

  const updateFeature = (packageType: string, index: number, value: string) => {
    const currentFeatures = [...formData.packages[packageType as keyof typeof formData.packages].features]
    currentFeatures[index] = value
    updatePackage(packageType, "features", currentFeatures)
  }

  const removeFeature = (packageType: string, index: number) => {
    const currentFeatures = formData.packages[packageType as keyof typeof formData.packages].features
    if (currentFeatures.length > 1) {
      updatePackage(
        packageType,
        "features",
        currentFeatures.filter((_, i) => i !== index),
      )
    }
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

    if (!formData.packages.basic.price || !formData.packages.basic.deliveryTime) {
      setError("يجب ملء بيانات الباقة الأساسية على الأقل")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to service page or dashboard
      router.push("/dashboard")
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء الخدمة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إضافة خدمة جديدة</h1>
            <p className="text-gray-600">أنشئ خدمتك وابدأ في استقبال الطلبات</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
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

            {/* Service Packages */}
            <Card>
              <CardHeader>
                <CardTitle>باقات الخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(formData.packages).map(([packageType, packageData]) => (
                    <div key={packageType} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4">{packageData.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">السعر (دج) *</Label>
                          <Input
                            value={packageData.price}
                            onChange={(e) => updatePackage(packageType, "price", e.target.value)}
                            placeholder="5000"
                            type="number"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">وقت التسليم *</Label>
                          <Input
                            value={packageData.deliveryTime}
                            onChange={(e) => updatePackage(packageType, "deliveryTime", e.target.value)}
                            placeholder="3 أيام"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">عدد التعديلات</Label>
                          <Input
                            value={packageData.revisions}
                            onChange={(e) => updatePackage(packageType, "revisions", e.target.value)}
                            placeholder="2"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">المميزات</Label>
                          <div className="space-y-2 mt-2">
                            {packageData.features.map((feature, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={feature}
                                  onChange={(e) => updateFeature(packageType, index, e.target.value)}
                                  placeholder="مميزة الخدمة"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFeature(packageType, index)}
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
                              onClick={() => addFeature(packageType)}
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

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>صور الخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">اسحب الصور هنا أو انقر للتحميل</p>
                  <p className="text-sm text-gray-500">PNG, JPG حتى 10MB</p>
                  <Button type="button" variant="outline" className="mt-4 bg-transparent">
                    اختر الصور
                  </Button>
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
              <Button type="submit" disabled={isLoading} className="btn-gradient text-white">
                {isLoading ? "جاري النشر..." : "نشر الخدمة"}
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
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
