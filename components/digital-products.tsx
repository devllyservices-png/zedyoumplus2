"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function DigitalProducts() {
  const { t } = useTranslation()
  
  const products = [
    {
      id: 1,
      title: t.digitalProducts.items.netflix.title,
      price: "1500",
      originalPrice: "2000",
      image: "https://i0.wp.com/www.ar-buy.com/wp-content/uploads/2024/09/netflix-cover.jpg?fit=600%2C338&ssl=1",
      features: t.digitalProducts.items.netflix.features,
      badge: t.digitalProducts.items.netflix.badge,
    },
    {
      id: 2,
      title: t.digitalProducts.items.playstation.title,
      price: "8500",
      originalPrice: "9000",
      image: "https://cdn.salla.sa/avWWR/nUAhNHOyX4aW9j2yEilO1AYUZxc1HUHZYh0qokZ6.png",
      features: t.digitalProducts.items.playstation.features,
      badge: t.digitalProducts.items.playstation.badge,
    },
    {
      id: 3,
      title: t.digitalProducts.items.xbox.title,
      price: "4200",
      originalPrice: "4500",
      image: "https://cdn.salla.sa/NDVOD/jMSSVdCu2QzOEJ8q7t5RqaXewPMOc9hkmrdvcnGN.png",
      features: t.digitalProducts.items.xbox.features,
      badge: t.digitalProducts.items.xbox.badge,
    },
    {
      id: 4,
      title: t.digitalProducts.items.spotify.title,
      price: "1200",
      originalPrice: "1500",
      image: "https://boycott4pal.net/uploads/images/2023/08/sue7V.webp",
      features: t.digitalProducts.items.spotify.features,
      badge: t.digitalProducts.items.spotify.badge,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-violet-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.digitalProducts.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.digitalProducts.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-2xl pt-0 transition-all duration-300 overflow-hidden border-0 shadow-lg"
            >
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">{product.badge}</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>

                <div className="space-y-2 mb-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl font-bold gradient-brand-text">{product.price} {t.services.currency}</div>
                  <div className="text-lg text-gray-500 line-through">{product.originalPrice} {t.services.currency}</div>
                </div>
                <Link href={`/digital-products/${product.id}`}>
                  <Button className="btn-gradient text-white w-full py-2 rounded-lg font-medium">{t.digitalProducts.buyNow}</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.digitalProducts.features.instantDelivery.title}</h3>
              <p className="text-gray-600">{t.digitalProducts.features.instantDelivery.description}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-violet-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.digitalProducts.features.guarantee.title}</h3>
              <p className="text-gray-600">{t.digitalProducts.features.guarantee.description}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.digitalProducts.features.support.title}</h3>
              <p className="text-gray-600">{t.digitalProducts.features.support.description}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="btn-gradient text-white px-8 py-3 text-lg font-medium rounded-xl">{t.digitalProducts.shopProducts}</Button>
        </div>
      </div>
    </section>
  )
}
