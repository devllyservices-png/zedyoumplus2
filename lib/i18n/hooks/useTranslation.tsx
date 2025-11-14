"use client"

import { useTranslation as useI18n } from "../index"
import { Language } from "../index"
import { useState, useEffect } from "react"

// You can extend this to get language from cookies, localStorage, or user preferences
export function useTranslation() {
  const [language, setLanguageState] = useState<Language>("fr")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load language from localStorage on mount
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "ar" || savedLang === "fr")) {
      setLanguageState(savedLang)
    }

    // Listen for language changes from other components
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem("language") as Language
      if (currentLang && (currentLang === "ar" || currentLang === "fr")) {
        setLanguageState(currentLang)
      }
    }

    window.addEventListener("languagechange", handleLanguageChange)
    return () => window.removeEventListener("languagechange", handleLanguageChange)
  }, [])

  const setLanguage = (lang: Language) => {
    if (typeof window !== "undefined") {
      setLanguageState(lang)
      localStorage.setItem("language", lang)
      // Dispatch event to notify other components
      window.dispatchEvent(new Event("languagechange"))
    }
  }

  // Use the language state, but ensure we have a valid translation object
  const t = useI18n(language)

  return {
    t,
    language,
    setLanguage,
    mounted,
  }
}

