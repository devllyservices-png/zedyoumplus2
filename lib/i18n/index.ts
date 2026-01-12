import { ar } from "./translations/ar"
import { fr } from "./translations/fr"
import { en } from "./translations/en"

export type Language = "ar" | "fr" | "en"

export type Translations = typeof ar

const translations: Record<Language, Translations> = {
  ar,
  fr,
  en,
}

// Default language
export const defaultLanguage: Language = "ar"

// Get translations for a specific language
export function getTranslations(lang: Language = defaultLanguage): Translations {
  return translations[lang] || translations[defaultLanguage]
}

// Translation hook for client components
export function useTranslation(lang: Language = defaultLanguage) {
  return getTranslations(lang)
}

