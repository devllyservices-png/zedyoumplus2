"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Search, Star, Download, Play, Gamepad2, LogInIcon as Subscription, Code, Palette, Music } from "lucide-react"
import { Footer } from "@/components/footer"

export default function DigitalProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const categories = [
    { id: "all", name: "جميع المنتجات", icon: null },
    { id: "games", name: "الألعاب", icon: Gamepad2 },
    { id: "subscriptions", name: "الاشتراكات", icon: Subscription },
    { id: "software", name: "البرمجيات", icon: Code },
    { id: "templates", name: "القوالب", icon: Palette },
    { id: "music", name: "الموسيقى", icon: Music },
  ]

 const digitalProducts = [
  {
    id: 1,
    title: "اشتراك نتفليكس - شهر واحد",
    description: "اشتراك نتفليكس بريميوم لمدة 3 أشهر مع جودة 4K",
    price: "1500",
    originalPrice: "2000",
    category: "subscriptions",
    type: "subscription",
    rating: 4.9,
    reviews: 567,
    downloads: 890,
    image: "https://i0.wp.com/www.ar-buy.com/wp-content/uploads/2024/09/netflix-cover.jpg?fit=600%2C338&ssl=1",
    tags: ["نتفليكس", "أفلام", "مسلسلات"],
    seller: "متجر الاشتراكات",
    duration: "3 أشهر",
    badge: "الأكثر مبيعًا",
    features: ["تسليم فوري", "ضمان شهر كامل", "دعم فني 24/7"],
  },
  {
    id: 2,
    title: "بطاقة شحن بلايستيشن 50$",
    description: "لعبة مغامرات مثيرة مع قصة شيقة وجرافيك عالي الجودة",
    price: "8500",
    originalPrice: "9000",
    category: "games",
    type: "game",
    rating: 4.8,
    reviews: 234,
    downloads: 1250,
    image: "https://cdn.salla.sa/avWWR/nUAhNHOyX4aW9j2yEilO1AYUZxc1HUHZYh0qokZ6.png",
    tags: ["مغامرات", "أكشن", "قصة"],
    seller: "استوديو الألعاب العربي",
    isOnSale: true,
    discount: 30,
    badge: "عرض محدود",
    features: ["كود أصلي", "يعمل في جميع البلدان", "تسليم خلال دقائق"],
  },
  {
    id: 3,
    title: "بطاقة شحن إكس بوكس 15$",
    description: "قالب HTML/CSS جاهز لمتجر إلكتروني مع لوحة تحكم",
    price: "4200",
    originalPrice: "4500",
    category: "templates",
    type: "template",
    rating: 4.7,
    reviews: 123,
    downloads: 456,
    image: "https://cdn.salla.sa/NDVOD/jMSSVdCu2QzOEJ8q7t5RqaXewPMOc9hkmrdvcnGN.png",
    tags: ["HTML", "CSS", "متجر إلكتروني"],
    seller: "مطور الويب المحترف",
    format: "HTML/CSS/JS",
    badge: "جديد",
    features: ["متوافق مع Xbox Live", "صالح لسنة كاملة", "تفعيل فوري"],
  },
  {
    id: 4,
    title: "اشتراك سبوتيفاي بريميوم",
    description: "برنامج قوي لتحرير الصور مع أدوات احترافية",
    price: "1200",
    originalPrice: "1500",
    category: "software",
    type: "software",
    rating: 4.6,
    reviews: 89,
    downloads: 234,
    image: "https://boycott4pal.net/uploads/images/2023/08/sue7V.webp",
    tags: ["تحرير", "صور", "تصميم"],
    seller: "شركة البرمجيات الإبداعية",
    license: "رخصة مدى الحياة",
    badge: "توفير 20%",
    features: ["بدون إعلانات", "جودة عالية", "تحميل للاستماع بدون إنترنت"],
  },
  {
    id: 5,
    title: "مجموعة موسيقى خلفية للفيديوهات",
    description: "50 مقطوعة موسيقية عالية الجودة بدون حقوق طبع",
    price: "1200",
    category: "music",
    type: "music",
    rating: 4.9,
    reviews: 345,
    downloads: 678,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSvtUvfbs_07vL880QLrzhQVg4cbiK928nug&s",
    tags: ["موسيقى", "خلفية", "بدون حقوق"],
    seller: "استوديو الموسيقى العربي",
    tracks: 50,
    format: "MP3/WAV",
  },
  {
    id: 6,
    title: "اشتراك Spotify Premium - 6 أشهر",
    description: "استمتع بالموسيقى بدون إعلانات مع جودة عالية",
    price: "3200",
    category: "subscriptions",
    type: "subscription",
    rating: 4.8,
    reviews: 432,
    downloads: 567,
    image: "https://boycott4pal.net/uploads/images/2023/08/sue7V.webp",
    tags: ["سبوتيفاي", "موسيقى", "بريميوم"],
    seller: "متجر الاشتراكات",
    duration: "6 أشهر",
  },
];


  const filteredProducts = digitalProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number.parseInt(a.price) - Number.parseInt(b.price)
      case "price-high":
        return Number.parseInt(b.price) - Number.parseInt(a.price)
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.id - a.id
      default: // popular
        return b.downloads - a.downloads
    }
  })

  const getProductIcon = (type: string) => {
    switch (type) {
      case "game":
        return <Gamepad2 className="w-5 h-5" />
      case "subscription":
        return <Subscription className="w-5 h-5" />
      case "software":
        return <Code className="w-5 h-5" />
      case "template":
        return <Palette className="w-5 h-5" />
      case "music":
        return <Music className="w-5 h-5" />
      default:
        return <Download className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-brand-text mb-4">المنتجات الرقمية</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من المنتجات الرقمية عالية الجودة - من الألعاب والاشتراكات إلى البرمجيات والقوالب
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="ابحث عن المنتجات الرقمية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon && <category.icon className="w-4 h-4" />}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">الأكثر شعبية</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.icon && <category.icon className="w-4 h-4" />}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group pt-0">
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Product Type Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-gray-700 flex items-center gap-1">
                    {getProductIcon(product.type)}
                    {product.type === "game" && "لعبة"}
                    {product.type === "subscription" && "اشتراك"}
                    {product.type === "software" && "برنامج"}
                    {product.type === "template" && "قالب"}
                    {product.type === "music" && "موسيقى"}
                  </Badge>
                </div>

                {/* Sale Badge */}
                {product.isOnSale && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white">خصم {product.discount}%</Badge>
                  </div>
                )}

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100">
                    <Play className="w-4 h-4 mr-2" />
                    معاينة
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">{product.title}</h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                    <span>({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{product.downloads}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-gray-500 mb-3">
                  {product.duration && <span>المدة: {product.duration}</span>}
                  {product.format && <span>الصيغة: {product.format}</span>}
                  {product.tracks && <span>عدد المقاطع: {product.tracks}</span>}
                  {product.license && <span>{product.license}</span>}
                </div>

                {/* Seller */}
                <p className="text-sm text-gray-600 mb-4">
                  بواسطة: <span className="font-medium">{product.seller}</span>
                </p>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{product.price} دج</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice} دج</span>
                    )}
                  </div>
                  <Button className="btn-gradient hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    شراء
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على منتجات</h3>
            <p className="text-gray-600">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
