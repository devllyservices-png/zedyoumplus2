import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabaseClient"
import { CategoryBrowseClient } from "@/components/category-browse-client"
import { getServerTranslations, getServerLanguage } from "@/lib/i18n/server"
import { pickCategoryLocale } from "@/lib/category-localized"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getServerTranslations()
  const { slug } = await params
  const { data } = await supabase
    .from("service_categories")
    .select(
      "title_ar, title_en, title_fr, description_ar, description_en, description_fr"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!data) {
    return {
      title: `${t.categoryPage.metaUnknownCategory} | ${t.categoryPage.brandName}`,
    }
  }

  const lang = getServerLanguage()
  const { title, description } = pickCategoryLocale(data, lang)

  return {
    title: `${title} | ${t.categoryPage.brandName}`,
    description: description?.trim() || undefined,
  }
}

export default async function CategoryBrowsePage({ params }: Props) {
  const { slug } = await params

  const { data: category, error } = await supabase
    .from("service_categories")
    .select(
      "slug, title_ar, title_en, title_fr, description_ar, description_en, description_fr, icon_key, gradient"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !category) {
    notFound()
  }

  const { count } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("category", slug)

  return (
    <CategoryBrowseClient
      category={{
        ...category,
        service_count: count ?? 0,
      }}
    />
  )
}
