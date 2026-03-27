import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ShoppingCart, Clock, CheckCircle, Star as StarIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ServicesListing from "@/components/services-listing"
import type { SellerStoreData } from "@/lib/seller-store"
import type { Translations } from "@/lib/i18n"

type Labels = Translations["sellerStore"]

function CompletionBar({
  percent,
  labelNone,
}: {
  percent: number | null
  labelNone: string
}) {
  const safePct = percent == null ? 0 : Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tabular-nums text-emerald-700">
          {percent == null ? labelNone : `${percent}%`}
        </span>
      </div>
      <div
        className="mt-2 h-2 rounded-full bg-emerald-100 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  )
}

export function SellerStoreView({
  data,
  labels,
}: {
  data: SellerStoreData
  labels: Labels
}) {
  const { seller, stats, orderMetrics, lastFinishedProject } = data
  const p = seller.profile
  const reviewsText = labels.reviewsCount.replace("{count}", String(stats.total_reviews))
  const completionText =
    orderMetrics.completionRatePercent == null ? labels.noData : `${orderMetrics.completionRatePercent}%`

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border">
        <CardContent className="p-4 sm:p-5">
          <div className="flex gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-white shadow-sm shrink-0">
              <AvatarImage
                src={p.avatar_url || "/images/avatar-fallback.svg"}
                alt={p.display_name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {p.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {p.display_name}
                </h1>
                {p.is_verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-4 h-4 ms-1" />
                    {labels.verified}
                  </Badge>
                )}
              </div>

              {p.bio && (
                <p className="mt-2 text-sm text-gray-700 leading-relaxed line-clamp-2">
                  {p.bio}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium tabular-nums">{stats.average_rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">{reviewsText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium tabular-nums">{orderMetrics.projectsCompleted}</span>
                  <span className="text-xs text-gray-500">{labels.projectsCompleted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums text-gray-800">{completionText}</span>
                  <span className="text-xs text-gray-500">{labels.completionRate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm font-semibold text-gray-900">{labels.completionRate}</p>
              <p className="text-xs text-muted-foreground">{labels.completionRateHint}</p>
              <div className="mt-2">
                <CompletionBar
                  percent={orderMetrics.completionRatePercent}
                  labelNone={labels.noData}
                />
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-sm font-semibold text-gray-900">{labels.lastProject}</p>
              <div className="mt-2">
                {lastFinishedProject ? (
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {lastFinishedProject.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {labels.finishedOn}{" "}
                      {new Date(lastFinishedProject.finishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {lastFinishedProject.kind === "service"
                        ? labels.kindService
                        : labels.kindDigitalProduct}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{labels.noData}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ServicesListing
        sellerId={seller.id}
        limit={12}
        showCategoryFilter={false}
        showSearch={true}
        showSort={true}
        showSeller={false}
        compact={true}
      />
    </div>
  )
}
