"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  defaultLanguage,
  getTranslations,
  type Language,
} from "@/lib/i18n"

type I18nContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: ReturnType<typeof getTranslations>
  mounted: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

function isLanguage(x: string | null | undefined): x is Language {
  return x === "ar" || x === "en" || x === "fr"
}

function readCookieLanguage(): Language | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(/(?:^|;\s*)language=([^;]+)/)
  const v = m?.[1]
  return isLanguage(v) ? v : null
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    const cookieLang = readCookieLanguage()
    let savedLang: string | null = null
    try {
      savedLang = localStorage.getItem("language")
    } catch {
      /* ignore */
    }
    const next: Language =
      cookieLang ?? (isLanguage(savedLang) ? savedLang : defaultLanguage)
    setLanguageState(next)
    if (isLanguage(savedLang) && savedLang !== cookieLang) {
      document.cookie = `language=${savedLang};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang =
      language === "ar" ? "ar" : language === "fr" ? "fr" : "en"
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang)
      try {
        localStorage.setItem("language", lang)
      } catch {
        /* ignore */
      }
      document.cookie = `language=${lang};path=/;max-age=31536000;SameSite=Lax`
      router.refresh()
    },
    [router]
  )

  const t = useMemo(() => getTranslations(language), [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      mounted,
    }),
    [language, setLanguage, t, mounted]
  )

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useTranslation must be used within I18nProvider")
  }
  return ctx
}
