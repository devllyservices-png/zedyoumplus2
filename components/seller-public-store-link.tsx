"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { Copy, Check } from "lucide-react"
import Link from "next/link"

export function SellerPublicStoreLink({ sellerId }: { sellerId: string }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/sellers/${sellerId}/store`)
    }
  }, [sellerId])

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setErr(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setErr(true)
    }
  }

  const ls = t.sellerStore

  return (
    <Card className="shadow-lg border-0 mb-6 border-emerald-100 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="text-lg">{ls.dashboardStoreTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{ls.dashboardStoreHint}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            readOnly
            value={url}
            className="font-mono text-sm"
            aria-label={ls.dashboardStoreTitle}
          />
          <Button type="button" onClick={copy} variant="outline" className="shrink-0">
            {copied ? (
              <Check className="w-4 h-4 me-2" aria-hidden />
            ) : (
              <Copy className="w-4 h-4 me-2" aria-hidden />
            )}
            {copied ? ls.copied : ls.copyLink}
          </Button>
          <Button asChild variant="default" className="shrink-0">
            <Link href={`/sellers/${sellerId}/store`} prefetch={true}>
              {ls.viewStore}
            </Link>
          </Button>
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground min-h-[1.25rem]">
          {err ? ls.copyFailed : copied ? ls.copied : ""}
        </p>
      </CardContent>
    </Card>
  )
}
