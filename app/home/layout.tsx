import type { ReactNode } from "react"
import type { Metadata } from "next"
import { getTranslations } from "@/lib/i18n"

const fr = getTranslations("fr")

export const metadata: Metadata = {
  title: fr.hero.title,
  description: fr.hero.subtitle,
  openGraph: {
    title: fr.hero.title,
    description: fr.hero.subtitle,
  },
  twitter: {
    title: fr.hero.title,
    description: fr.hero.subtitle,
  },
}

export default function HomeLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
