"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Clock, Heart  } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"


export default  function ServicesPage() {
  
 const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [services , setServices] = useState<any[]>([])

//  const services = [
//   {
//     id: "1",
//     title: "تصميم شعار احترافي مع هوية بصرية كاملة",
//     description: "سأقوم بتصميم شعار احترافي وفريد لعلامتك التجارية مع تقديم الهوية البصرية الكاملة",
//     price: "5000",
//     originalPrice: "7000",
//     rating: 4.9,
//     reviews: 127,
//     deliveryTime: "3 أيام",
//     seller: {
//       name: "أحمد محمد",
//       avatar: "https://i.pravatar.cc/40?u=ahmed-mohamed",
//       level: "مستوى متقدم",
//       isVerified: true,
//     },
//           image: "https://fiverr-res.cloudinary.com/t_gig_cards_web_x2,q_auto,f_auto/gigs/403884315/original/c6bf2f6539934edd8a8c13a4d5b4ce9e3dfef512.jpg",

//     category: "design",
//     tags: ["شعار", "هوية بصرية", "تصميم"],
//     featured: true,
//   },
//   {
//     id: "2",
//     title: "تطوير موقع ووردبريس متجاوب ومحسن للسيو",
//     description: "تطوير موقع ووردبريس احترافي متجاوب مع جميع الأجهزة ومحسن لمحركات البحث",
//     price: "15000",
//     originalPrice: "20000",
//     rating: 4.8,
//     reviews: 89,
//     deliveryTime: "7 أيام",
//     seller: {
//       name: "فاطمة بن علي",
//       avatar: "https://i.pravatar.cc/40?u=fatma-ben-ali",
//       level: "مستوى خبير",
//       isVerified: true,
//     },
//       image: "https://khamsat.hsoubcdn.com/images/services/715359/8fc01e88cf1dd7d66219f020e365f2a6.jpg?s=small",
//     category: "programming",
//     tags: ["ووردبريس", "تطوير مواقع", "سيو"],
//     featured: false,
//   },
//   {
//     id: "3",
//     title: "إدارة حسابات التواصل الاجتماعي لمدة شهر",
//     description: "إدارة شاملة لحساباتك على منصات التواصل الاجتماعي مع إنشاء محتوى جذاب",
//     price: "8000",
//     originalPrice: "10000",
//     rating: 4.7,
//     reviews: 156,
//     deliveryTime: "1 يوم",
//     seller: {
//       name: "يوسف الجزائري",
//       avatar: "https://i.pravatar.cc/40?u=youssef-algerie",
//       level: "مستوى متوسط",
//       isVerified: false,
//     },
//          image: "https://eshhar.net/wp-content/uploads/2020/10/%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9-%D8%B5%D9%81%D8%AD%D8%A7%D8%AA-%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84-%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%D9%8A0.jpg",

//     category: "marketing",
//     tags: ["سوشيال ميديا", "إدارة حسابات", "محتوى"],
//     featured: true,
//   },
//   {
//     id: "4",
//     title: "كتابة محتوى تسويقي وإعلاني احترافي",
//     description: "كتابة محتوى تسويقي مقنع وجذاب لموقعك أو حملاتك الإعلانية",
//     price: "3000",
//     originalPrice: "4000",
//     rating: 4.9,
//     reviews: 203,
//     deliveryTime: "2 أيام",
//     seller: {
//       name: "سارة قاسمي",
//       avatar: "https://i.pravatar.cc/40?u=sara-qasimi",
//       level: "مستوى متقدم",
//       isVerified: true,
//     },
//          image: "https://blog.khamsat.com/wp-content/uploads/2021/11/%D8%A3%D8%B3%D8%B1%D8%A7%D8%B1-%D9%84%D8%AA%D8%AD%D8%AA%D8%B1%D9%81-%D9%83%D8%AA%D8%A7%D8%A8%D8%A9-%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D9%88%D9%89-%D8%A7%D9%84%D8%A5%D8%A8%D8%AF%D8%A7%D8%B9%D9%8A.png",

//     category: "writing",
//     tags: ["كتابة", "محتوى تسويقي", "إعلانات"],
//     featured: false,
//   },
//   {
//     id: "5",
//     title: "مونتاج فيديو احترافي مع مؤثرات بصرية",
//     description: "مونتاج احترافي لفيديوهاتك مع إضافة المؤثرات البصرية والصوتية",
//     price: "12000",
//     originalPrice: "15000",
//     rating: 4.8,
//     reviews: 74,
//     deliveryTime: "5 أيام",
//     seller: {
//       name: "كريم بوعلام",
//       avatar: "https://i.pravatar.cc/40?u=karim-boualam",
//       level: "مستوى خبير",
//       isVerified: true,
//     },
//     image: "https://picsum.photos/seed/video-editing/800/600",
//     category: "video",
//     tags: ["مونتاج", "فيديو", "مؤثرات"],
//     featured: true,
//   },
//   {
//     id: "6",
//     title: "ترجمة نصوص متخصصة عربي-إنجليزي",
//     description: "ترجمة احترافية ودقيقة للنصوص المتخصصة في مختلف المجالات",
//     price: "2500",
//     originalPrice: "3500",
//     rating: 4.9,
//     reviews: 312,
//     deliveryTime: "1 يوم",
//     seller: {
//       name: "نادية حمدي",
//       avatar: "https://i.pravatar.cc/40?u=nadia-hamdi",
//       level: "مستوى متقدم",
//       isVerified: true,
//     },
//          image: "https://blog.khamsat.com/wp-content/uploads/2022/05/%D8%AF%D9%84%D9%8A%D9%84%D9%83-%D8%A5%D9%84%D9%89-%D8%AA%D8%B1%D8%AC%D9%85%D8%A9-%D8%A7%D9%84%D9%86%D8%B5%D9%88%D8%B5-%D8%A7%D9%84%D9%85%D8%B1%D8%A6%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%85%D8%B3%D9%85%D9%88%D8%B9%D8%A9.png",

//     category: "writing",
//     tags: ["ترجمة", "عربي", "إنجليزي"],
//     featured: false,
//   },
// ];


async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      title,
      description,
      category,
      tags,
      images,
      packages,
      profile_id (
        id,
        name,
        user_type,
        is_verified
      )
    `);

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  // Transform into mock-like structure
  return data.map((service) => {
    const firstPackage = service.packages?.[0];

    return {
      id: service.id,
      title: service.title,
      description: service.description,
      price: firstPackage?.price ?? "0",
      originalPrice: firstPackage?.price ?? "0", // keep same for now
      rating: 0,
      reviews: 0,
      deliveryTime: firstPackage?.deliveryTime
        ? `${firstPackage.deliveryTime} أيام`
        : "غير محدد",
      seller: {
        name: service.profile_id?.name || "مجهول",
        avatar: service.profile_id?.avatar_url || "https://i.pravatar.cc/40",
        level: service.profile_id?.level || "مستوى جديد",
        isVerified: service.profile_id?.is_verified || false,
      },
      image: service.images?.mainImage || "https://via.placeholder.com/300",
      category: service.category,
      tags: service.tags ?? [],
      featured: false,
    };
  });
}
 useEffect(() => {
  const fetchServices = async () => {
    const servicesList = await getServices();
    console.log("Services:", servicesList);
    setServices(servicesList);
  };

  fetchServices();
}, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4 items-center  justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-brand-text text-center">خدماتي</h1>
              <p className="text-gray-600 mt-2">قم بإدارة وتعديل خدماتك المعروضة بكل سهولة من هنا</p>
            </div>
          </div>

        
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            تم العثور على <span className="font-semibold">{services.length}</span> خدمة
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
          {services.map((service) => (
            <Card
              key={service.id}
              className={`group hover:shadow-xl transition-all duration-300 overflow-hidden pt-0 ${
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

        {services.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على خدمات</h3>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
            {/* <Button
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
            </Button> */}
          </div>
        )}

        {/* Load More */}
        {services.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8 py-3 text-lg bg-transparent">
              تحميل المزيد من الخدمات
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
