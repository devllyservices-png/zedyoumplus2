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
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function CategoriesSection() {
  const { t } = useTranslation()
  
  const categories = [
    {
      id: "design",
      name: t.categories.items.design,
      icon: Palette,
      gradient: "from-pink-500 to-purple-600",
    },
    {
      id: "programming",
      name: t.categories.items.programming,
      icon: Code,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "translation",
      name: t.categories.items.translation,
      icon: Languages,
      gradient: "from-green-500 to-teal-600",
    },
    {
      id: "marketing",
      name: t.categories.items.marketing,
      icon: Megaphone,
      gradient: "from-orange-500 to-red-600",
    },
    {
      id: "education",
      name: t.categories.items.education,
      icon: GraduationCap,
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      id: "audio",
      name: t.categories.items.audio,
      icon: Music,
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      id: "photography",
      name: t.categories.items.photography,
      icon: Camera,
      gradient: "from-gray-500 to-gray-700",
    },
    {
      id: "illustration",
      name: t.categories.items.illustration,
      icon: PenTool,
      gradient: "from-rose-500 to-pink-600",
    },
    {
      id: "mobile",
      name: t.categories.items.mobile,
      icon: Smartphone,
      gradient: "from-emerald-500 to-green-600",
    },
    {
      id: "seo",
      name: t.categories.items.seo,
      icon: Globe,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "content",
      name: t.categories.items.content,
      icon: FileText,
      gradient: "from-amber-500 to-yellow-600",
    },
    {
      id: "video",
      name: t.categories.items.video,
      icon: Video,
      gradient: "from-red-500 to-pink-600",
    },
  ]
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t.categories.title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.categories.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base leading-tight">{category.name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
