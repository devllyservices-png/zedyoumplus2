"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PayPalTestSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{
    ok: boolean
    message: string
    status?: string
  }>({ ok: false, message: "" })

  useEffect(() => {
    const capture = async () => {
      const token =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("token")
          : null

      if (!token) {
        setResult({ ok: false, message: "Missing token from PayPal callback." })
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/paypal/test/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypal_order_id: token }),
        })
        const data = await res.json()

        if (!res.ok) {
          const parts = [data?.error, data?.details, data?.apiBase && `API: ${data.apiBase}`]
            .filter(Boolean)
            .join(" — ")
          throw new Error(parts || "Capture failed.")
        }

        const status = String(data?.status || "")
        if (status === "COMPLETED") {
          setResult({
            ok: true,
            message: "Payment captured successfully.",
            status,
          })
        } else {
          setResult({
            ok: false,
            message: `Capture returned status: ${status || "unknown"}.`,
            status,
          })
        }
      } catch (e) {
        setResult({
          ok: false,
          message: e instanceof Error ? e.message : "Unexpected capture error.",
        })
      } finally {
        setLoading(false)
      }
    }

    capture()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">PayPal test result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            {loading ? (
              <p>Capturing PayPal payment...</p>
            ) : (
              <div
                className={`rounded-md px-3 py-2 ${
                  result.ok
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {result.message}
                {result.status ? ` (${result.status})` : ""}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/paypal-test")}
            >
              Back to PayPal test page
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

