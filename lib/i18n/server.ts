import { cookies } from "next/headers"
import { getTranslations, defaultLanguage, type Language } from "./index"

/** Active language for server components from the `language` cookie (same as client). */
export function getServerLanguage(): Language {
  const raw = cookies().get("language")?.value
  return raw === "ar" || raw === "en" || raw === "fr" ? raw : defaultLanguage
}

/** Resolves UI copy for server components (metadata, RSC) from the `language` cookie when set. */
export function getServerTranslations() {
  return getTranslations(getServerLanguage())
}
