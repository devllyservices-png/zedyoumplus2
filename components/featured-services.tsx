"use client"

// import { useState } from "react"
import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function FeaturedServices() {
  // const [selectedCategory, setSelectedCategory] = useState("all")
  // const [selectedPrice, setSelectedPrice] = useState("all")
  // const [selectedDelivery, setSelectedDelivery] = useState("all")

  const services = [
    {
      id: 1,
      title: "تصميم شعار احترافي",
      price: "5000",
      rating: 4.9,
      reviews: 127,
      deliveryTime: "3 أيام",
      seller: "أحمد محمد",
      image: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/403884315/original/c6bf2f6539934edd8a8c13a4d5b4ce9e3dfef512.jpg",
    },
    {
      id: 2,
      title: "تطوير موقع ووردبريس",
      price: "15000",
      rating: 4.8,
      reviews: 89,
      deliveryTime: "7 أيام",
      seller: "فاطمة بن علي",
      image: "https://khamsat.hsoubcdn.com/images/services/715359/8fc01e88cf1dd7d66219f020e365f2a6.jpg?s=small",
    },
    {
      id: 3,
      title: "إدارة حسابات التواصل الاجتماعي",
      price: "8000",
      rating: 4.7,
      reviews: 156,
      deliveryTime: "1 يوم",
      seller: "يوسف الجزائري",
      image: "https://eshhar.net/wp-content/uploads/2020/10/%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%B5%D9%81%D8%AD%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84-%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%D9%8A0.jpg",
    },
    {
      id: 4,
      title: "كتابة محتوى تسويقي",
      price: "3000",
      rating: 4.9,
      reviews: 203,
      deliveryTime: "2 أيام",
      seller: "سارة قاسمي",
      image: "https://blog.khamsat.com/wp-content/uploads/2021/11/%D8%A3%D8%B3%D8%B1%D8%A7%D8%B1-%D9%84%D8%AA%D8%AD%D8%AA%D8%B1%D9%81-%D9%83%D8%AA%D8%A7%D8%A8%D8%A9-%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89-%D8%A7%D9%84%D8%A5%D8%A8%D8%AF%D8%A7%D8%B9%D9%8A.png",
    },
    {
      id: 5,
      title: "مونتاج فيديو احترافي",
      price: "12000",
      rating: 4.8,
      reviews: 74,
      deliveryTime: "5 أيام",
      seller: "كريم بوعلام",
      image: "https://kafiil.s3.eu-central-1.amazonaws.com/media/gig_other/02815f8ab8fbe44eebb06314555c4487/c/80ee9c0d9280ab18e3f9ed9a531aeb5e-large.jpg",
    },
    {
      id: 6,
      title: "ترجمة نصوص متخصصة",
      price: "2500",
      rating: 4.9,
      reviews: 312,
      deliveryTime: "1 يوم",
      seller: "نادية حمدي",
      image: "https://blog.khamsat.com/wp-content/uploads/2022/05/%D8%AF%D9%84%D9%8A%D9%84%D9%83-%D8%A5%D9%84%D9%89-%D8%AA%D8%B1%D8%AC%D9%85%D8%A9-%D8%A7%D9%84%D9%86%D8%B5%D9%88%D8%B5-%D8%A7%D9%84%D9%85%D8%B1%D8%A6%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%B3%D9%85%D9%88%D8%B9%D8%A9.png",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">الخدمات الأكثر طلبًا</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف أفضل الخدمات المقدمة من المستقلين الجزائريين المحترفين
          </p>
        </div>

        {/* Filters
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="design">التصميم والجرافيك</SelectItem>
              <SelectItem value="programming">البرمجة والتطوير</SelectItem>
              <SelectItem value="marketing">التسويق الرقمي</SelectItem>
              <SelectItem value="writing">الكتابة والترجمة</SelectItem>
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
        </div> */}

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="group pt-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{service.seller}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
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
                  <div className="text-2xl font-bold gradient-brand-text">{service.price} دج</div>
                  <Link href={`/services/${service.id}`}>
                    <Button className="btn-gradient text-white px-6 py-2 rounded-lg">اطلب الآن</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/services">
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
            >
              عرض المزيد من الخدمات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
