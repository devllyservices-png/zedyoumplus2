"use client"

import { Shield, Headphones, Globe, Award } from "lucide-react"
import { motion } from "framer-motion"

export function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: "دفع آمن بوسائل جزائرية 100%",
      description: "ندعم جميع وسائل الدفع المحلية: Chargily، CCP، CIB، Visa، Mastercard والتحويل البنكي",
    },
    {
      icon: Headphones,
      title: "دعم فني سريع ومتجاوب",
      description: "فريق الدعم الفني متاح 24/7 لحل جميع استفساراتك ومشاكلك بسرعة",
    },
    {
      icon: Globe,
      title: "منصة عربية بواجهة سهلة",
      description: "تصميم عصري وسهل الاستخدام باللغة العربية مع دعم كامل للغة المحلية",
    },
    {
      icon: Award,
      title: "منتجات وخدمات موثوقة ومضمونة",
      description: "جميع الخدمات والمنتجات مراجعة ومعتمدة من فريقنا لضمان أعلى جودة",
    },
  ]

  return (
    <section className="py-20 gradient-brand">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">لماذا تختار منصتنا؟</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">نحن نقدم تجربة فريدة ومميزة للمستخدمين الجزائريين</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 group-hover:bg-white/30 transition-all duration-300">
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 leading-tight">{feature.title}</h3>
              <p className="text-white/80 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">انضم إلى آلاف المستخدمين الراضين</h3>
            <p className="text-white/90 text-lg mb-6">أكثر من 10,000 مستخدم يثق في منصتنا لتلبية احتياجاتهم الرقمية</p>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-white/80">مستخدم نشط</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                <div className="text-white/80">خدمة مكتملة</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div className="text-white/80">نسبة الرضا</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
