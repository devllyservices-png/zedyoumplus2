"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Star, User, Shield, MessageCircle, Heart, Share2, ArrowRight, Check } from "lucide-react"

export default function ServiceDetailPage() {
  const params = useParams()
  const [selectedPackage, setSelectedPackage] = useState("basic")
  const [orderNotes, setOrderNotes] = useState("")

  // Mock service data - in real app, fetch based on params.id
  const service = {
    id: params.id,
    title: "تصميم شعار احترافي مع هوية بصرية كاملة",
    description:
      "سأقوم بتصميم شعار احترافي وفريد لعلامتك التجارية مع تقديم الهوية البصرية الكاملة. أضمن لك تصميماً مبتكراً يعكس شخصية علامتك التجارية ويجذب عملاءك المستهدفين.",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    rating: 4.9,
    reviews: 127,
    totalOrders: 450,
    seller: {
      name: "أحمد محمد",
      avatar: "/placeholder.svg?height=80&width=80",
      level: "مستوى متقدم",
      isVerified: true,
      memberSince: "2022",
      responseTime: "خلال ساعة",
      completionRate: "98%",
      location: "الجزائر العاصمة",
      languages: ["العربية", "الإنجليزية", "الفرنسية"],
    },
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
          "نسخة بالأبيض والأسود",
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
          "نسخة بالأبيض والأسود",
          "تصميم بطاقة أعمال",
          "تصميم ورقة رسمية",
          "ملف المصدر (AI/PSD)",
        ],
      },
    },
    category: "التصميم والجرافيك",
    tags: ["شعار", "هوية بصرية", "تصميم", "برندنج"],
    faq: [
      {
        question: "كم من الوقت يستغرق تصميم الشعار؟",
        answer: "يعتمد على الباقة المختارة، من 3 إلى 7 أيام عمل.",
      },
      {
        question: "هل يمكنني طلب تعديلات؟",
        answer: "نعم، كل باقة تتضمن عدد معين من التعديلات المجانية.",
      },
      {
        question: "ما هي صيغ الملفات التي سأحصل عليها؟",
        answer: "ستحصل على ملفات PNG، JPG، وحسب الباقة قد تحصل على PDF، AI، وPSD.",
      },
    ],
  }

  const reviews = [
    {
      id: 1,
      user: "محمد العربي",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "منذ أسبوع",
      comment: "عمل ممتاز وتسليم في الوقت المحدد. الشعار جاء أفضل من توقعاتي.",
    },
    {
      id: 2,
      user: "فاطمة بن علي",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "منذ أسبوعين",
      comment: "تعامل راقي ومهني. أنصح بالتعامل معه بشدة.",
    },
    {
      id: 3,
      user: "يوسف قاسمي",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "منذ شهر",
      comment: "جودة عالية وسعر مناسب. شكراً لك.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Images */}
            <Card className="overflow-hidden">
              <div className="relative">
                <Image
                  src={service.images[0] || "/placeholder.svg"}
                  alt={service.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {service.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`صورة ${index + 1}`}
                      width={100}
                      height={80}
                      className="w-20 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            </Card>

            {/* Service Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800">{service.category}</Badge>
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-gray-600">({service.reviews} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>{service.totalOrders} طلب</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">{service.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">تفاصيل الخدمة</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات ({service.reviews})</TabsTrigger>
                <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">ما ستحصل عليه</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تصميم فريد ومبتكر</h4>
                          <p className="text-gray-600">شعار مصمم خصيصاً لعلامتك التجارية</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">ملفات عالية الجودة</h4>
                          <p className="text-gray-600">جميع الملفات بدقة عالية وجاهزة للطباعة</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">تعديلات مجانية</h4>
                          <p className="text-gray-600">إمكانية التعديل حسب الباقة المختارة</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {service.faq.map((item, index) => (
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={service.seller.avatar || "/placeholder.svg"} alt={service.seller.name} />
                    <AvatarFallback className="text-xl">{service.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{service.seller.name}</h3>
                      {service.seller.isVerified && <Shield className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="text-gray-600">{service.seller.level}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">عضو منذ:</span>
                    <span className="font-medium">{service.seller.memberSince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وقت الاستجابة:</span>
                    <span className="font-medium">{service.seller.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الإنجاز:</span>
                    <span className="font-medium">{service.seller.completionRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموقع:</span>
                    <span className="font-medium">{service.seller.location}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    تواصل مع البائع
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>اطلب الخدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">اختر الباقة</label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(service.packages).map(([key, pkg]) => (
                        <SelectItem key={key} value={key}>
                          {pkg.name} - {pkg.price} دج
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">
                    {service.packages[selectedPackage as keyof typeof service.packages].name}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السعر:</span>
                      <span className="font-bold gradient-brand-text">
                        {service.packages[selectedPackage as keyof typeof service.packages].price} دج
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>وقت التسليم:</span>
                      <span>{service.packages[selectedPackage as keyof typeof service.packages].deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التعديلات:</span>
                      <span>{service.packages[selectedPackage as keyof typeof service.packages].revisions}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">المميزات:</p>
                    <ul className="space-y-1">
                      {service.packages[selectedPackage as keyof typeof service.packages].features.map(
                        (feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-3 h-3 text-green-600" />
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
                    placeholder="أضف أي تفاصيل أو متطلبات خاصة..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Order Button */}
                <Button className="w-full btn-gradient text-white h-12 text-lg font-medium">
                  اطلب الآن - {service.packages[selectedPackage as keyof typeof service.packages].price} دج
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 inline mr-1" />
                  دفع آمن ومضمون
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
