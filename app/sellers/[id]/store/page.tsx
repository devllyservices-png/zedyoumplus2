import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getSellerStoreData } from "@/lib/seller-store"
import { SellerStoreView } from "@/components/seller-store"
import { getServerTranslations } from "@/lib/i18n/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getSellerStoreData(id)
  const t = getServerTranslations()
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
  const t = getServerTranslations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <SellerStoreView data={data} labels={t.sellerStore} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
