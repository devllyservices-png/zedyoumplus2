"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type PayPalCheckoutProps = {
  serviceId?: string
  packageId?: string
  productId?: string
}

declare global {
  interface Window {
    paypal?: any
  }
}

export function PayPalCheckout({ serviceId, packageId, productId }: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

    if (!clientId) {
      setError("لم يتم إعداد PayPal بشكل صحيح (لا يوجد معرف عميل).")
      return
    }

    const loadScript = async () => {
      if (window.paypal) {
        return
      }
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("فشل تحميل سكربت PayPal"))
        document.body.appendChild(script)
      })
    }

    const renderButtons = async () => {
      try {
        setLoading(true)
        await loadScript()

        if (!window.paypal || !containerRef.current) {
          setError("تعذر تهيئة PayPal.")
          setLoading(false)
          return
        }

        window.paypal
          .Buttons({
            createOrder: async () => {
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  service_id: serviceId || undefined,
                  package_id: packageId || undefined,
                  product_id: productId || undefined,
                }),
              })
              const data = await res.json()
              if (!res.ok) {
                throw new Error(data.error || "فشل إنشاء طلب PayPal")
              }
              return data.paypalOrderId
            },
            onApprove: async (data: any) => {
              const res = await fetch("/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  paypal_order_id: data.orderID,
                }),
              })
              const result = await res.json()
              if (!res.ok) {
                throw new Error(result.error || "فشل تأكيد دفع PayPal")
              }

              if (result.orderId) {
                router.push(`/checkout/success?orderId=${result.orderId}`)
              } else {
                router.push("/orders")
              }
            },
            onError: (err: any) => {
              console.error("PayPal onError:", err)
              setError("حدث خطأ أثناء الدفع عبر PayPal. يرجى المحاولة مرة أخرى.")
            },
            onCancel: () => {
              // Optional: show a message or keep silent
            },
          })
          .render(containerRef.current)
          .catch((err: any) => {
            console.error("PayPal render error:", err)
            setError("تعذر عرض زر PayPal.")
          })
          .finally(() => setLoading(false))
      } catch (err) {
        console.error(err)
        setError("حدث خطأ أثناء تحميل PayPal.")
        setLoading(false)
      }
    }

    renderButtons()
  }, [serviceId, packageId, productId, router])

  if (error) {
    return (
      <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-gray-600">
        عند الضغط على زر PayPal أدناه، سيتم إنشاء طلبك وإكمال عملية الدفع في وضع الاختبار (sandbox).
      </p>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          جاري تحميل واجهة PayPal...
        </div>
      )}
      <div ref={containerRef} />
      {!loading && !window.paypal && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          إعادة تحميل PayPal
        </Button>
      )}
    </div>
  )
}

