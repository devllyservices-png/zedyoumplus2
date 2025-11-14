"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function Testimonials() {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: t.testimonials.items.ahmed.name,
      location: t.testimonials.items.ahmed.location,
      rating: 5,
      comment: t.testimonials.items.ahmed.comment,
      avatar: "https://cdn-icons-png.flaticon.com/512/4128/4128176.png",
    },
    {
      id: 2,
      name: t.testimonials.items.fatima.name,
      location: t.testimonials.items.fatima.location,
      rating: 5,
      comment: t.testimonials.items.fatima.comment,
      avatar: "https://cdn-icons-png.flaticon.com/512/4128/4128253.png",
    },
    {
      id: 3,
      name: t.testimonials.items.youssef.name,
      location: t.testimonials.items.youssef.location,
      rating: 5,
      comment: t.testimonials.items.youssef.comment,
      avatar: "https://cdn-icons-png.flaticon.com/512/4128/4128176.png",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000) // change every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const testimonial = testimonials[currentIndex]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.testimonials.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto transition-all duration-500">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                <p className="text-gray-600">{testimonial.location}</p>
              </div>

              <div className="flex justify-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                {testimonial.comment}
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
