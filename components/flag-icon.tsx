"use client"

import { Language } from "@/lib/i18n"

interface FlagIconProps {
  language: Language
  className?: string
  size?: number
}

export function FlagIcon({ language, className = "", size = 24 }: FlagIconProps) {
  const flagEmoji = language === "fr" ? "🇫🇷" : language === "en" ? "🇬🇧" : "🇩🇿"
  const ariaLabel = language === "fr" ? "French flag" : language === "en" ? "English flag" : "Algerian flag"
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
      role="img"
      aria-label={ariaLabel}
    >
      {flagEmoji}
    </span>
  )
}

