"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PayPalTestPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    setStatus(sp.get("status"))
  }, [])

  const statusMessage = useMemo(() => {
    if (status === "cancelled") {
      return "Payment was cancelled in PayPal sandbox."
    }
    if (status === "failed") {
      return "Payment capture failed. Please try again."
    }
    return null
  }, [status])

  const startTestPayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/paypal/test/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()

      if (!res.ok || !data?.approvalUrl) {
        throw new Error(data?.error || "Failed to start sandbox payment.")
      }

      window.location.href = data.approvalUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">PayPal Sandbox Public Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              This page is public and requires no authentication. It creates a sandbox
              PayPal order for exactly <strong>1 EUR</strong> so you can validate
              credentials and callback flow.
            </p>

            {statusMessage && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                {statusMessage}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                {error}
              </div>
            )}

            <Button onClick={startTestPayment} disabled={loading} className="w-full">
              {loading ? "Redirecting to PayPal..." : "Test PayPal Sandbox (1 EUR)"}
            </Button>

            <p className="text-xs text-slate-500">
              Ensure <code>PAYPAL_MODE=sandbox</code> and sandbox credentials are set.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

