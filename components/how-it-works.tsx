"use client"

import { UserPlus, Search, CreditCard } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function HowItWorks() {
  const { t } = useTranslation()
  
  const steps = [
    {
      icon: UserPlus,
      title: t.howItWorks.steps.createAccount.title,
      description: t.howItWorks.steps.createAccount.description,
    },
    {
      icon: Search,
      title: t.howItWorks.steps.choose.title,
      description: t.howItWorks.steps.choose.description,
    },
    {
      icon: CreditCard,
      title: t.howItWorks.steps.pay.title,
      description: t.howItWorks.steps.pay.description,
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.howItWorks.subtitle}</p>
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
