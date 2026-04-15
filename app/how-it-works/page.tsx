"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserPlus, Search, CreditCard, CheckCircle, Shield, Headphones, Clock } from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HowItWorksPage() {
  const { t, mounted } = useTranslation()

  // Wait for client-side hydration to complete to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main></main>
        <Footer />
      </div>
    )
  }

  const mainSteps = [
    {
      icon: UserPlus,
      title: t.howItWorks.steps.createAccount.title,
      description: t.howItWorks.steps.createAccount.description,
      details: t.howItWorks.steps.createAccount.detail,
    },
    {
      icon: Search,
      title: t.howItWorks.steps.choose.title,
      description: t.howItWorks.steps.choose.description,
      details: t.howItWorks.steps.choose.detail,
    },
    {
      icon: CreditCard,
      title: t.howItWorks.steps.pay.title,
      description: t.howItWorks.steps.pay.description,
      details: t.howItWorks.steps.pay.detail,
    },
  ]

  const features = [
    {
      icon: Shield,
      title: t.howItWorks.highlights.securePayment.title,
      description: t.howItWorks.highlights.securePayment.description,
    },
    {
      icon: Headphones,
      title: t.howItWorks.highlights.support.title,
      description: t.howItWorks.highlights.support.description,
    },
    {
      icon: Clock,
      title: t.howItWorks.highlights.fastDelivery.title,
      description: t.howItWorks.highlights.fastDelivery.description,
    },
    {
      icon: CheckCircle,
      title: t.howItWorks.highlights.quality.title,
      description: t.howItWorks.highlights.quality.description,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-500 via-violet-500 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-5xl font-bold mb-6">{t.howItWorks.title}</h1>
              <p className="text-xl text-white/90 mb-8">{t.howItWorks.subtitle}</p>
              <p className="text-lg text-white/80">{t.howItWorks.heroIntro}</p>
            </motion.div>
          </div>
        </section>

        {/* Main Steps */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {mainSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">{step.description}</p>
                  <p className="text-gray-500 leading-relaxed">{step.details}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.featuresSectionTitle}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.howItWorks.featuresSectionSubtitle}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.footer.paymentMethods.title}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.howItWorks.paymentMethodsSubtitle}</p>
            </motion.div>

            <div className="flex justify-center items-center gap-6 flex-wrap max-w-4xl mx-auto">
              {[
                t.footer.paymentMethods.chargily,
                t.footer.paymentMethods.ccp,
                t.footer.paymentMethods.cib,
                t.footer.paymentMethods.paypal,
                t.footer.paymentMethods.bankTransfer,
              ].map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border-2 border-gray-100"
                >
                  <span className="text-gray-700 font-semibold text-sm">{method}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-cyan-500 via-violet-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold mb-6">{t.howItWorks.cta.title}</h2>
              <p className="text-xl text-white/90 mb-8">{t.howItWorks.cta.description}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6">
                    {t.howItWorks.cta.register}
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white !bg-transparent text-white shadow-none hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 text-lg px-8 py-6"
                  >
                    {t.howItWorks.cta.browseServices}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

