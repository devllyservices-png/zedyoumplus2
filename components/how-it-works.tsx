"use client"

import { UserPlus, Search, CreditCard } from "lucide-react"
import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "أنشئ حسابك",
      description: "سجّل كمشتري أو مقدم خدمة في دقائق معدودة",
    },
    {
      icon: Search,
      title: "اختر ما تريد",
      description: "استعرض الخدمات أو المنتجات الرقمية المتاحة",
    },
    {
      icon: CreditCard,
      title: "ادفع بسهولة",
      description: "بوسائل دفع جزائرية موثوقة ومضمونة",
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">كيف تعمل المنصة</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">ثلاث خطوات بسيطة للبدء في استخدام منصتنا</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
