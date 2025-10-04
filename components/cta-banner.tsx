"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function CTABanner() {
  return (
    <section className="py-20 gradient-brand">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
          >
            ابدأ الآن… الخدمة أو المنتج الذي تحتاجه أقرب إليك مما تتخيل
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            انضم إلى آلاف المستخدمين الذين يثقون في منصتنا لتلبية احتياجاتهم الرقمية
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-xl shadow-lg">
              سجّل مجانًا
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-bold rounded-xl bg-transparent"
            >
              تعرف على المزيد
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { title: "مجاني", subtitle: "التسجيل" },
              { title: "آمن", subtitle: "الدفع" },
              { title: "سريع", subtitle: "التسليم" },
              { title: "24/7", subtitle: "الدعم" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 + index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="text-3xl font-bold text-white mb-2">{item.title}</div>
                <div className="text-white/80">{item.subtitle}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
