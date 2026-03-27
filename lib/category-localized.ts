import type { Language } from "@/lib/i18n"

/** Row shape for multilingual category copy (DB + API). */
export type CategoryLocaleFields = {
  title_ar: string
  title_en: string
  title_fr: string
  description_ar: string | null
  description_en: string | null
  description_fr: string | null
}

const TITLE_KEYS: Record<Language, keyof Pick<CategoryLocaleFields, "title_ar" | "title_en" | "title_fr">> =
  {
    ar: "title_ar",
    en: "title_en",
    fr: "title_fr",
  }

const DESC_KEYS: Record<
  Language,
  keyof Pick<
    CategoryLocaleFields,
    "description_ar" | "description_en" | "description_fr"
  >
> = {
  ar: "description_ar",
  en: "description_en",
  fr: "description_fr",
}

const FALLBACK_ORDER: Language[] = ["ar", "en", "fr"]

function firstNonEmptyTitle(
  row: CategoryLocaleFields,
  preferred: Language[]
): string {
  for (const lang of preferred) {
    const v = row[TITLE_KEYS[lang]]?.trim()
    if (v) return v
  }
  return ""
}

function firstNonEmptyDescription(
  row: CategoryLocaleFields,
  preferred: Language[]
): string | null {
  for (const lang of preferred) {
    const raw = row[DESC_KEYS[lang]]
    const v = typeof raw === "string" ? raw.trim() : ""
    if (v) return v
  }
  return null
}

/**
 * Picks title/description for the current UI language, with fallback
 * requested → ar → en → fr.
 */
export function pickCategoryLocale(
  row: CategoryLocaleFields,
  lang: Language
): { title: string; description: string | null } {
  const titleOrder = [
    lang,
    ...FALLBACK_ORDER.filter((l) => l !== lang),
  ] as Language[]
  const descOrder = titleOrder

  return {
    title: firstNonEmptyTitle(row, titleOrder),
    description: firstNonEmptyDescription(row, descOrder),
  }
}
