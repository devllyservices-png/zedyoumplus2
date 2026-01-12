"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function ContactPage() {
  const { t, mounted } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus("success")
      setFormData({ name: "", email: "", subject: "", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000)
    }, 1500)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: t.contactPage.contactInfo.email,
      value: t.footer.contact.email,
      link: `mailto:${t.footer.contact.email}`,
      isWhatsApp: false,
    },
    {
      icon: Phone,
      title: t.contactPage.contactInfo.phone,
      value: t.footer.contact.phone,
      link: `tel:${t.footer.contact.phone}`,
      isWhatsApp: false,
    },
    {
      icon: MapPin,
      title: t.contactPage.contactInfo.address,
      value: t.footer.contact.address,
      link: "#",
      isWhatsApp: false,
    },
    {
      icon: Phone,
      title: "واتساب",
      value: "+213 557 46 91 13",
      link: "https://wa.me/213557469113",
      isWhatsApp: true,
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
              <h1 className="text-5xl font-bold mb-6">{t.footer.contact.title}</h1>
              <p className="text-xl text-white/90">
                {t.contactPage.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      {t.contactPage.form.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.contactPage.form.name}
                        </label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t.contactPage.form.namePlaceholder}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.contactPage.form.email}
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t.contactPage.form.emailPlaceholder}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.contactPage.form.subject}
                        </label>
                        <Input
                          id="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={t.contactPage.form.subjectPlaceholder}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.contactPage.form.message}
                        </label>
                        <Textarea
                          id="message"
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={t.contactPage.form.messagePlaceholder}
                          rows={6}
                          className="w-full"
                        />
                      </div>

                      {submitStatus === "success" && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
                          {t.contactPage.form.success}
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                          {t.contactPage.form.error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-gradient text-white hover:bg-blue-700"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-5 h-5 mr-2 animate-spin" />
                            {t.contactPage.form.sending}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            {t.contactPage.form.send}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t.contactPage.contactInfo.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <motion.a
                        key={index}
                        href={info.link}
                        target={info.isWhatsApp ? "_blank" : undefined}
                        rel={info.isWhatsApp ? "noopener noreferrer" : undefined}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        {info.isWhatsApp ? (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            <WhatsAppButton size={48} className="m-0" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <info.icon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                          <p className="text-gray-600">{info.value}</p>
                        </div>
                      </motion.a>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-lg bg-gradient-to-br from-cyan-50 to-violet-50 border-2 border-cyan-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Clock className="w-8 h-8 text-cyan-600 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{t.contactPage.workingHours.title}</h3>
                        <div className="space-y-2 text-gray-700">
                          <p>{t.contactPage.workingHours.weekdays}</p>
                          <p>{t.contactPage.workingHours.weekend}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                          {t.contactPage.workingHours.note}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">{t.contactPage.faq.title}</h3>
                    <div className="space-y-4 text-sm text-gray-600">
                      <p>
                        <strong className="text-gray-900">{t.contactPage.faq.howToOrder.question}</strong>
                        <br />
                        {t.contactPage.faq.howToOrder.answer}
                      </p>
                      <p>
                        <strong className="text-gray-900">{t.contactPage.faq.paymentMethods.question}</strong>
                        <br />
                        {t.contactPage.faq.paymentMethods.answer}
                      </p>
                      <p>
                        <strong className="text-gray-900">{t.contactPage.faq.becomeSeller.question}</strong>
                        <br />
                        {t.contactPage.faq.becomeSeller.answer}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.contactPage.additionalInfo.title}</h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.footer.description}
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">{t.contactPage.additionalInfo.support24.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {t.contactPage.additionalInfo.support24.description}
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">{t.contactPage.additionalInfo.quickResponse.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {t.contactPage.additionalInfo.quickResponse.description}
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">{t.contactPage.additionalInfo.qualityGuarantee.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {t.contactPage.additionalInfo.qualityGuarantee.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

