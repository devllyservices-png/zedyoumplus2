import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getSellerStoreData } from "@/lib/seller-store"
import { SellerStoreView } from "@/components/seller-store"
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getSellerStoreData(id)
  const t = await getServerTranslations()
  if (!data) {
    return {
      title: `${t.sellerStore.notFound} | ${t.sellerStore.brandName}`,
    }
  }
  const name = data.seller.profile.display_name
  const desc = data.seller.profile.bio?.trim() || undefined
  return {
    title: `${name} | ${t.sellerStore.brandName}`,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
    },
  }
}

export default async function SellerStorePage({ params }: Props) {
  const { id } = await params
  const data = await getSellerStoreData(id)
  if (!data) notFound()
  const t = await getServerTranslations()
  const language = await getServerLanguage()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="relative border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)]" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-7xl mx-auto">
            <SellerStoreView data={data} labels={t.sellerStore} language={language} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
