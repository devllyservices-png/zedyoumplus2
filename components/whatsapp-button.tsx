"use client"

import Image from "next/image"
import Link from "next/link"

interface WhatsAppButtonProps {
  phoneNumber?: string
  className?: string
  size?: number
  floating?: boolean
}

export function WhatsAppButton({ 
  phoneNumber = "+213557469113",
  className = "",
  size = 60,
  floating = false
}: WhatsAppButtonProps) {
  // Remove all non-numeric characters for WhatsApp link
  const cleanPhone = phoneNumber.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}`

  if (floating) {
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 left-6 z-50 hover:scale-110 transition-transform duration-300 ${className}`}
        aria-label="تواصل معنا عبر واتساب"
      >
        <Image
          src="/socials/whatsapp.png"
          alt="واتساب"
          width={size}
          height={size}
          className="rounded-full shadow-2xl hover:shadow-green-500/50 transition-shadow"
        />
      </Link>
    )
  }

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block hover:scale-110 transition-transform duration-300 ${className}`}
      aria-label="تواصل معنا عبر واتساب"
    >
      <Image
        src="/socials/whatsapp.png"
        alt="واتساب"
        width={size}
        height={size}
        className="rounded-full"
      />
    </Link>
  )
}
