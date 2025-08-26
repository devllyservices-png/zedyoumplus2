"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  Shield,
  MessageCircle,
  Heart,
  Share2,
  ArrowRight,
  Check,
  Download,
  Smartphone,
  Monitor,
  Gamepad2,
  Zap,
  Clock,
  Users,
} from "lucide-react"
import { Header } from "@/components/header"
import { LoginPopup } from "@/components/login-popup"
import { Footer } from "@/components/footer"

export default function DigitalProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState("basic")
  const [orderNotes, setOrderNotes] = useState("")
  const [showLoginPopup, setShowLoginPopup] = useState(false)

  const handleOrderClick = () => {
    // Check if user is logged in by looking for user data in localStorage
    const userData = localStorage.getItem("user")

    if (!userData) {
      // Show login popup if user is not logged in
      setShowLoginPopup(true)
    } else {
      // User is logged in, proceed to checkout
      router.push(
        `/checkout?serviceId=${params.id}&package=${selectedPackage}&notes=${encodeURIComponent(orderNotes)}&type=digital`,
      )
    }
  }

  const product = {
    id: params.id,
    title: "اشتراك نتفليكس - شهر واحد",
    description:
      "اشتراك نتفليكس بريميوم لمدة 3 أشهر مع جودة 4K. استمتع بآلاف الأفلام والمسلسلات العربية والعالمية بأعلى جودة. يدعم التشغيل على جميع الأجهزة مع إمكانية المشاهدة دون اتصال بالإنترنت.",
    images: [
      "https://i0.wp.com/www.ar-buy.com/wp-content/uploads/2024/09/netflix-cover.jpg?fit=600%2C338&ssl=1",
      "https://i0.wp.com/www.ar-buy.com/wp-content/uploads/2024/09/netflix-cover.jpg?fit=600%2C338&ssl=1",
      "https://i0.wp.com/www.ar-buy.com/wp-content/uploads/2024/09/netflix-cover.jpg?fit=600%2C338&ssl=1",
    ],
    rating: 4.9,
    reviews: 567,
    totalDownloads: 890,
    seller: {
      name: "متجر الاشتراكات",
      avatar: "/placeholder.svg?height=80&width=80",
      level: "بائع معتمد",
      isVerified: true,
      memberSince: "2020",
      responseTime: "خلال 15 دقيقة",
      supportRate: "99.8%",
      location: "الجزائر العاصمة",
      languages: ["العربية", "الإنجليزية", "الفرنسية"],
    },
    packages: {
      basic: {
        name: "اشتراك شهر واحد",
        price: "1500",
        duration: "شهر واحد",
        users: "حساب واحد",
        features: [
          "جودة HD",
          "مشاهدة على جهاز واحد",
          "مكتبة كاملة من الأفلام والمسلسلات",
          "محتوى عربي حصري",
          "تسليم فوري",
          "ضمان شهر كامل",
        ],
      },
      standard: {
        name: "اشتراك 3 أشهر",
        price: "4000",
        duration: "3 أشهر",
        users: "حسابين",
        features: [
          "جودة Full HD",
          "مشاهدة على جهازين",
          "تحميل للمشاهدة دون إنترنت",
          "مكتبة كاملة من الأفلام والمسلسلات",
          "محتوى عربي وعالمي حصري",
          "تسليم فوري",
          "ضمان 3 أشهر كاملة",
          "دعم فني 24/7",
        ],
      },
      premium: {
        name: "اشتراك 6 أشهر - الأكثر مبيعًا",
        price: "7500",
        duration: "6 أشهر",
        users: "4 حسابات",
        features: [
          "جودة 4K Ultra HD",
          "مشاهدة على 4 أجهزة",
          "تحميل غير محدود",
          "مكتبة كاملة من الأفلام والمسلسلات",
          "محتوى حصري وجديد أولاً بأول",
          "صوت محيطي Dolby Atmos",
          "تسليم فوري",
          "ضمان 6 أشهر كاملة",
          "دعم فني أولوية عالية",
          "استرداد كامل خلال 7 أيام",
        ],
      },
    },
    category: "اشتراكات",
    tags: ["نتفليكس", "أفلام", "مسلسلات", "ترفيه"],
    platforms: ["التلفزيون الذكي", "الجوال", "الكمبيوتر", "التابلت", "PlayStation", "Xbox"],
    systemRequirements: {
      web: "متصفح حديث، اتصال إنترنت 5 ميجا للـ HD",
      mobile: "تطبيق نتفليكس، iOS 12+ أو Android 5+",
      desktop: "تطبيق نتفليكس أو متصفح، Windows 10+ أو macOS 10.10+",
    },
    faq: [
      {
        question: "كم من الوقت يستغرق تفعيل الاشتراك؟",
        answer: "يتم تفعيل الاشتراك فوراً خلال 5-10 دقائق من إتمام الدفع.",
      },
      {
        question: "هل يمكنني مشاهدة المحتوى العربي؟",
        answer: "نعم، نتفليكس يحتوي على مكتبة ضخمة من الأفلام والمسلسلات العربية الحصرية.",
      },
      {
        question: "ماذا لو لم يعمل الاشتراك؟",
        answer: "نوفر ضمان كامل، وفي حالة وجود أي مشكلة نقوم بالاستبدال أو الاسترداد فوراً.",
      },
      {
        question: "هل يمكنني تغيير كلمة المرور؟",
        answer: "نعم، ستحصل على بيانات الحساب كاملة ويمكنك تغيير كلمة المرور والإعدادات.",
      },
    ],
  }

  const reviews = [
    {
      id: 1,
      user: "فاطمة الزهراء",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "منذ أسبوع",
      comment: "اشتراك ممتاز! وصل فوراً وجودة 4K رائعة. المحتوى العربي متنوع وجديد.",
    },
    {
      id: 2,
      user: "عبد الرحمن أحمد",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "منذ أسبوعين",
      comment: "أفضل سعر لاشتراك نتفليكس. التسليم سريع والدعم الفني ممتاز.",
    },
    {
      id: 3,
      user: "مريم بن علي",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "منذ شهر",
      comment: "اشتراك موثوق وسعر معقول. استمتعت بالمسلسلات الكورية والعربية.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Images */}
            <Card className="overflow-hidden border-0 shadow-xl pt-0 bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white backdrop-blur-sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    <Download className="w-3 h-3 mr-1" />
                    {product.totalDownloads} تحميل
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`صورة ${index + 1}`}
                      width={100}
                      height={80}
                      className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all hover:scale-105 border-2 border-transparent hover:border-blue-300"
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Product Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                    {product.category}
                  </Badge>
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {product.title}
                </h1>

                <div className="flex items-center gap-6 mb-6 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-gray-600">({product.reviews} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Download className="w-5 h-5" />
                    <span>{product.totalDownloads} تحميل</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>متعدد المستخدمين</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg mb-6">{product.description}</p>

                {/* Platform Support */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    المنصات المدعومة
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.platforms.map((platform, index) => (
                      <Badge key={index} className="bg-white text-gray-700 border border-gray-200">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="features">المميزات</TabsTrigger>
                <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات ({product.reviews})</TabsTrigger>
                <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-6 h-6 text-red-600" />
                      مميزات اشتراك نتفليكس
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">جودة 4K Ultra HD</h4>
                          <p className="text-gray-600">مشاهدة بأعلى جودة متاحة</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">محتوى حصري</h4>
                          <p className="text-gray-600">أفلام ومسلسلات نتفليكس الأصلية</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تحميل للمشاهدة دون إنترنت</h4>
                          <p className="text-gray-600">شاهد في أي مكان وأي وقت</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">متعدد الأجهزة</h4>
                          <p className="text-gray-600">مشاهدة على جميع أجهزتك</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">متطلبات النظام</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Monitor className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تطبيق الويب</h4>
                          <p className="text-gray-600">{product.systemRequirements.web}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تطبيق الجوال</h4>
                          <p className="text-gray-600">{product.systemRequirements.mobile}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Gamepad2 className="w-5 h-5 text-purple-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تطبيق سطح المكتب</h4>
                          <p className="text-gray-600">{product.systemRequirements.desktop}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                              <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{review.user}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {product.faq.map((item, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                          <p className="text-gray-700">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={product.seller.avatar || "/placeholder.svg"} alt={product.seller.name} />
                    <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {product.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{product.seller.name}</h3>
                      {product.seller.isVerified && <Shield className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="text-gray-600">{product.seller.level}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عضو منذ:</span>
                    <span className="font-medium">{product.seller.memberSince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت الاستجابة:</span>
                    <span className="font-medium">{product.seller.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الدعم:</span>
                    <span className="font-medium">{product.seller.supportRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموقع:</span>
                    <span className="font-medium">{product.seller.location}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    تواصل مع المطور
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card className="border-0 shadow-xl pt-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-2">
                <CardTitle className="flex items-center gap-2 ">
                  <Download className="w-5 h-5" />
                  اشترك الآن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Package Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">اختر الباقة</label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger className="border-2 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(product.packages).map(([key, pkg]) => (
                        <SelectItem key={key} value={key}>
                          {pkg.name} - {pkg.price} دج
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Details */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
                  <h4 className="font-semibold mb-3 text-blue-800">
                    {product.packages[selectedPackage as keyof typeof product.packages].name}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السعر:</span>
                      <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {product.packages[selectedPackage as keyof typeof product.packages].price} دج
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المدة:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {product.packages[selectedPackage as keyof typeof product.packages].duration}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>المستخدمين:</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {product.packages[selectedPackage as keyof typeof product.packages].users}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">المميزات:</p>
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {product.packages[selectedPackage as keyof typeof product.packages].features.map(
                        (feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ملاحظات إضافية (اختياري)</label>
                  <Textarea
                    placeholder="أضف أي متطلبات خاصة أو أسئلة..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="border-2 focus:border-blue-500"
                  />
                </div>

                <Button
                  onClick={handleOrderClick}
                  className="w-full btn-gradient hover:shadow-lg text-white h-12 text-lg font-medium transition-all hover:scale-105"
                >
                  اشترك الآن - {product.packages[selectedPackage as keyof typeof product.packages].price} دج
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 inline mr-1" />
                  دفع آمن ومضمون • إلغاء في أي وقت
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        <Footer />
    </div>
  )
}
