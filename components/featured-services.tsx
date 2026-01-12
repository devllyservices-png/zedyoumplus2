"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

type ServiceRecord = {
  id: string
  title: string
  description?: string
  category?: string
  images?: { mainImage?: string | null; additionalImages?: string[]; totalImages?: number } | null
  packages?: Array<{ name?: string; price?: string; deliveryTime?: string; revisions?: string; features?: string[] }>
}

export function FeaturedServices() {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const load = async () => {
      setError("")
      setIsLoading(true)
      try {
        const { data, error: dbError } = await supabase
          .from("services")
          .select("id, title, description, category, images, packages")
          .order("created_at", { ascending: false })
          .limit(6)

        if (dbError) throw dbError
        setServices(data || [])
      } catch (e: any) {
        setError(e?.message || "تعذر تحميل الخدمات")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">الخدمات الأكثر طلبًا</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اكتشف أفضل الخدمات المقدمة من المستقلين المحترفين حول العالم
          </p>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-2/3 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-5 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">لا توجد خدمات لعرضها حالياً.</p>
            <Link href="/services">
              <Button className="btn-gradient text-white px-6 py-2 rounded-lg">استعرض كل الخدمات</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const mainImage = (service.images as any)?.mainImage || "/placeholder.svg"
              const firstPackage = service.packages?.[0]
              const price = firstPackage?.price || "—"
              const delivery = firstPackage?.deliveryTime || "—"
              return (
                <Card key={service.id} className="group pt-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <Image
                      src={mainImage}
                      alt={service.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{delivery}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold gradient-brand-text">{price} دج</div>
                      <Link href={`/services/${service.id}`}>
                        <Button className="btn-gradient text-white px-6 py-2 rounded-lg">اطلب الآن</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/services">
            <Button
              variant="outline"
              className="px-8 py-3 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
            >
              عرض المزيد من الخدمات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
