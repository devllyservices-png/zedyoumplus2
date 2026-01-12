"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function WhatsAppFloat() {
  const { t, language } = useTranslation()
  const [isWiggling, setIsWiggling] = useState(false)
  const phoneNumber = "+213557469113"
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}`
  const isRTL = language === "ar"

  useEffect(() => {
    // Wiggle animation every 5 seconds
    const wiggleInterval = setInterval(() => {
      setIsWiggling(true)
      
      // Stop wiggling after animation completes
      setTimeout(() => {
        setIsWiggling(false)
      }, 1000)
    }, 5000)

    return () => clearInterval(wiggleInterval)
  }, [])

  return (
    <div className={`fixed ${isRTL ? "left-6" : "right-6"} bottom-6 z-50`}>
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block hover:scale-110 transition-transform duration-300"
        style={{
          animation: isWiggling ? "wiggle 1s ease-in-out" : "none",
        }}
        aria-label={t.footer.contact.helpMessage}
      >
        <Image
          src="/socials/whatsapp.png"
          alt="واتساب"
          width={60}
          height={60}
          className="rounded-full shadow-2xl hover:shadow-green-500/50 transition-shadow"
        />
      </Link>
    </div>
  )
}
