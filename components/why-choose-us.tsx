"use client"

import { Shield, Headphones, Globe, Award } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function WhyChooseUs() {
  const { t } = useTranslation()
  
  const features = [
    {
      icon: Shield,
      title: t.whyChooseUs.features.securePayment.title,
      description: t.whyChooseUs.features.securePayment.description,
    },
    {
      icon: Headphones,
      title: t.whyChooseUs.features.support.title,
      description: t.whyChooseUs.features.support.description,
    },
    {
      icon: Globe,
      title: t.whyChooseUs.features.platform.title,
      description: t.whyChooseUs.features.platform.description,
    },
    {
      icon: Award,
      title: t.whyChooseUs.features.quality.title,
      description: t.whyChooseUs.features.quality.description,
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
          <h2 className="text-4xl font-bold text-white mb-4">{t.whyChooseUs.title}</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">{t.whyChooseUs.subtitle}</p>
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
            <h3 className="text-2xl font-bold text-white mb-4">{t.whyChooseUs.stats.joinTitle}</h3>
            <p className="text-white/90 text-lg mb-6">{t.whyChooseUs.stats.joinDescription}</p>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <div className="text-white/80">{t.whyChooseUs.stats.activeUsers}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                <div className="text-white/80">{t.whyChooseUs.stats.completedServices}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div className="text-white/80">{t.whyChooseUs.stats.satisfaction}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
