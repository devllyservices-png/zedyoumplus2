"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Clock, Heart, Grid, List } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedDelivery, setSelectedDelivery] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories = [
    { value: "all", label: "جميع الفئات" },
    { value: "design", label: "التصميم والجرافيك" },
    { value: "programming", label: "البرمجة والتطوير" },
    { value: "marketing", label: "التسويق الرقمي" },
    { value: "writing", label: "الكتابة والترجمة" },
    { value: "video", label: "المونتاج والفيديو" },
    { value: "business", label: "الأعمال والاستشارات" },
    { value: "music", label: "الموسيقى والصوتيات" },
  ]

  const services = [
    {
      id: "1",
      title: "تصميم شعار احترافي مع هوية بصرية كاملة",
      description: "سأقوم بتصميم شعار احترافي وفريد لعلامتك التجارية مع تقديم الهوية البصرية الكاملة",
      price: "5000",
      originalPrice: "7000",
      rating: 4.9,
      reviews: 127,
      deliveryTime: "3 أيام",
      seller: {
        name: "أحمد محمد",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى متقدم",
        isVerified: true,
      },
      image: "/services/design/logo-design.svg",
      category: "design",
      tags: ["شعار", "هوية بصرية", "تصميم"],
      featured: true,
    },
    {
      id: "2",
      title: "تطوير موقع ووردبريس متجاوب ومحسن للسيو",
      description: "تطوير موقع ووردبريس احترافي متجاوب مع جميع الأجهزة ومحسن لمحركات البحث",
      price: "15000",
      originalPrice: "20000",
      rating: 4.8,
      reviews: 89,
      deliveryTime: "7 أيام",
      seller: {
        name: "فاطمة بن علي",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى خبير",
        isVerified: true,
      },
      image: "/services/programming/wordpress-development.svg",
      category: "programming",
      tags: ["ووردبريس", "تطوير مواقع", "سيو"],
      featured: false,
    },
    {
      id: "3",
      title: "إدارة حسابات التواصل الاجتماعي لمدة شهر",
      description: "إدارة شاملة لحساباتك على منصات التواصل الاجتماعي مع إنشاء محتوى جذاب",
      price: "8000",
      originalPrice: "10000",
      rating: 4.7,
      reviews: 156,
      deliveryTime: "1 يوم",
      seller: {
        name: "يوسف الجزائري",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى متوسط",
        isVerified: false,
      },
      image: "/services/marketing/social-media-management.svg",
      category: "marketing",
      tags: ["سوشيال ميديا", "إدارة حسابات", "محتوى"],
      featured: true,
    },
    {
      id: "4",
      title: "كتابة محتوى تسويقي وإعلاني احترافي",
      description: "كتابة محتوى تسويقي مقنع وجذاب لموقعك أو حملاتك الإعلانية",
      price: "3000",
      originalPrice: "4000",
      rating: 4.9,
      reviews: 203,
      deliveryTime: "2 أيام",
      seller: {
        name: "سارة قاسمي",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى متقدم",
        isVerified: true,
      },
      image: "/services/writing/content-writing.svg",
      category: "writing",
      tags: ["كتابة", "محتوى تسويقي", "إعلانات"],
      featured: false,
    },
    {
      id: "5",
      title: "مونتاج فيديو احترافي مع مؤثرات بصرية",
      description: "مونتاج احترافي لفيديوهاتك مع إضافة المؤثرات البصرية والصوتية",
      price: "12000",
      originalPrice: "15000",
      rating: 4.8,
      reviews: 74,
      deliveryTime: "5 أيام",
      seller: {
        name: "كريم بوعلام",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى خبير",
        isVerified: true,
      },
      image: "/services/video/video-editing.svg",
      category: "video",
      tags: ["مونتاج", "فيديو", "مؤثرات"],
      featured: true,
    },
    {
      id: "6",
      title: "ترجمة نصوص متخصصة عربي-إنجليزي",
      description: "ترجمة احترافية ودقيقة للنصوص المتخصصة في مختلف المجالات",
      price: "2500",
      originalPrice: "3500",
      rating: 4.9,
      reviews: 312,
      deliveryTime: "1 يوم",
      seller: {
        name: "نادية حمدي",
        avatar: "/placeholder.svg?height=40&width=40",
        level: "مستوى متقدم",
        isVerified: true,
      },
      image: "/services/writing/translation-services.svg",
      category: "writing",
      tags: ["ترجمة", "عربي", "إنجليزي"],
      featured: false,
    },
  ]

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "low" && Number.parseInt(service.price) < 5000) ||
      (selectedPrice === "medium" &&
        Number.parseInt(service.price) >= 5000 &&
        Number.parseInt(service.price) <= 15000) ||
      (selectedPrice === "high" && Number.parseInt(service.price) > 15000)
    const matchesDelivery =
      selectedDelivery === "all" ||
      (selectedDelivery === "fast" && service.deliveryTime.includes("1")) ||
      (selectedDelivery === "medium" &&
        (service.deliveryTime.includes("2") ||
          service.deliveryTime.includes("3") ||
          service.deliveryTime.includes("5"))) ||
      (selectedDelivery === "long" && Number.parseInt(service.deliveryTime) > 5)
    const matchesRating =
      selectedRating === "all" ||
      (selectedRating === "high" && service.rating >= 4.5) ||
      (selectedRating === "medium" && service.rating >= 4.0 && service.rating < 4.5)

    return matchesSearch && matchesCategory && matchesPrice && matchesDelivery && matchesRating
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">استعرض الخدمات</h1>
              <p className="text-gray-600 mt-2">اكتشف أفضل الخدمات من المستقلين الجزائريين المحترفين</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="ابحث عن خدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12 text-lg"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="السعر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأسعار</SelectItem>
                  <SelectItem value="low">أقل من 5000 دج</SelectItem>
                  <SelectItem value="medium">5000 - 15000 دج</SelectItem>
                  <SelectItem value="high">أكثر من 15000 دج</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDelivery} onValueChange={setSelectedDelivery}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="وقت التسليم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأوقات</SelectItem>
                  <SelectItem value="fast">يوم واحد</SelectItem>
                  <SelectItem value="medium">2-5 أيام</SelectItem>
                  <SelectItem value="long">أكثر من 5 أيام</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التقييمات</SelectItem>
                  <SelectItem value="high">4.5+ نجوم</SelectItem>
                  <SelectItem value="medium">4.0+ نجوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            تم العثور على <span className="font-semibold">{filteredServices.length}</span> خدمة
          </p>
          <Select defaultValue="popular">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">الأكثر شعبية</SelectItem>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
              <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
              <SelectItem value="rating">التقييم الأعلى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Services Grid/List */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <div className={`relative ${viewMode === "list" ? "w-64 flex-shrink-0" : ""}`}>
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  width={300}
                  height={200}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    viewMode === "list" ? "w-full h-full" : "w-full h-48"
                  }`}
                />
                {service.featured && <Badge className="absolute top-3 right-3 bg-red-500 text-white">مميز</Badge>}
                <button className="absolute top-3 left-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-start gap-3 mb-3">
                  <Image
                    src={service.seller.avatar || "/placeholder.svg"}
                    alt={service.seller.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{service.seller.name}</span>
                      {service.seller.isVerified && <Badge className="bg-green-100 text-green-800 text-xs">موثق</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">{service.seller.level}</p>
                  </div>
                </div>

                <Link href={`/services/${service.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {service.title}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {service.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-gray-500">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.deliveryTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold gradient-brand-text">{service.price} دج</div>
                    {service.originalPrice && (
                      <div className="text-lg text-gray-500 line-through">{service.originalPrice} دج</div>
                    )}
                  </div>
                  <Link href={`/services/${service.id}`}>
                    <Button className="btn-gradient text-white px-6 py-2 rounded-lg">عرض التفاصيل</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على خدمات</h3>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedPrice("all")
                setSelectedDelivery("all")
                setSelectedRating("all")
              }}
              variant="outline"
            >
              إعادة تعيين الفلاتر
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredServices.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8 py-3 text-lg bg-transparent">
              تحميل المزيد من الخدمات
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
