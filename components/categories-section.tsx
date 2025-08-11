"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Palette,
  Code,
  Languages,
  Megaphone,
  GraduationCap,
  Music,
  Camera,
  PenTool,
  Smartphone,
  Globe,
  FileText,
  Video,
} from "lucide-react"

const categories = [
  {
    id: "design",
    name: "التصميم الجرافيكي",
    icon: Palette,
    gradient: "from-pink-500 to-purple-600",
  },
  {
    id: "programming",
    name: "البرمجة وتطوير المواقع",
    icon: Code,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "translation",
    name: "الترجمة والكتابة",
    icon: Languages,
    gradient: "from-green-500 to-teal-600",
  },
  {
    id: "marketing",
    name: "التسويق الرقمي",
    icon: Megaphone,
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "education",
    name: "التعليم والدروس",
    icon: GraduationCap,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    id: "audio",
    name: "الصوتيات والمونتاج",
    icon: Music,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "photography",
    name: "التصوير والفوتوغرافيا",
    icon: Camera,
    gradient: "from-gray-500 to-gray-700",
  },
  {
    id: "illustration",
    name: "الرسم والتوضيح",
    icon: PenTool,
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "mobile",
    name: "تطبيقات الجوال",
    icon: Smartphone,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "seo",
    name: "تحسين محركات البحث",
    icon: Globe,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "content",
    name: "كتابة المحتوى",
    icon: FileText,
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    id: "video",
    name: "المونتاج والفيديو",
    icon: Video,
    gradient: "from-red-500 to-pink-600",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">استكشف التصنيفات</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة واسعة من الخدمات المتخصصة من أفضل المستقلين في الجزائر
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/70 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm lg:text-base leading-tight">{category.name}</h3>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
