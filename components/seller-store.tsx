import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BadgeCheck,
  Star,
  ShoppingBag,
  Percent,
  CalendarDays,
  Store,
} from "lucide-react"
import ServicesListing from "@/components/services-listing"
import type { SellerStoreData } from "@/lib/seller-store"
import type { Language, Translations } from "@/lib/i18n"

type Labels = Translations["sellerStore"]

const iconProps = {
  className: "shrink-0",
  strokeWidth: 1.75,
  size: 18,
} as const

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
        <span className="text-sm font-semibold tabular-nums text-indigo-700">
          {percent == null ? labelNone : `${percent}%`}
        </span>
      </div>
      <div
        className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-indigo-500 to-violet-500 transition-[width] duration-500"
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  )
}

const localeForLanguage: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
}

export function SellerStoreView({
  data,
  labels,
  language,
}: {
  data: SellerStoreData
  labels: Labels
  language: Language
}) {
  const { seller, stats, orderMetrics, lastFinishedProject } = data
  const p = seller.profile
  const reviewsText = labels.reviewsCount.replace("{count}", String(stats.total_reviews))
  const completionText =
    orderMetrics.completionRatePercent == null ? labels.noData : `${orderMetrics.completionRatePercent}%`
  const dateLocale = localeForLanguage[language]

  return (
    <div className="space-y-10">
      {/* Store header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div
          className="h-1 w-full bg-gradient-to-l from-indigo-500 via-violet-500 to-slate-400"
          aria-hidden="true"
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl ring-2 ring-slate-100 shadow-sm">
              <AvatarImage
                src={p.avatar_url || "/images/avatar-fallback.svg"}
                alt={p.display_name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-xl font-semibold text-white">
                {p.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    {p.display_name}
                  </h1>
                  {p.is_verified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-emerald-800 hover:bg-emerald-50"
                    >
                      <BadgeCheck
                        className="size-4 shrink-0 text-emerald-600"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className="text-xs font-medium">{labels.verified}</span>
                    </Badge>
                  )}
                </div>
                {p.bio && (
                  <p className="max-w-3xl text-sm sm:text-[15px] leading-relaxed text-slate-600">
                    {p.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-sm text-slate-800">
                  <Star
                    className="size-4 text-amber-500"
                    fill="currentColor"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="font-semibold tabular-nums">{stats.average_rating.toFixed(1)}</span>
                  <span className="text-slate-500">{reviewsText}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-sm text-slate-800">
                  <ShoppingBag {...iconProps} className="text-slate-500" aria-hidden />
                  <span className="font-semibold tabular-nums">{orderMetrics.projectsCompleted}</span>
                  <span className="text-slate-500">{labels.projectsCompleted}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-sm text-slate-800">
                  <Percent {...iconProps} className="text-indigo-600" aria-hidden />
                  <span className="font-semibold tabular-nums">{completionText}</span>
                  <span className="text-slate-500">{labels.completionRate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Percent {...iconProps} className="text-indigo-600" aria-hidden />
                <p className="text-sm font-semibold text-slate-900">{labels.completionRate}</p>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-500">{labels.completionRateHint}</p>
              <CompletionBar percent={orderMetrics.completionRatePercent} labelNone={labels.noData} />
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays {...iconProps} className="text-indigo-600" aria-hidden />
                <p className="text-sm font-semibold text-slate-900">{labels.lastProject}</p>
              </div>
              {lastFinishedProject ? (
                <div className="space-y-2">
                  <p className="font-medium leading-snug text-slate-900 line-clamp-2">
                    {lastFinishedProject.title.trim() || labels.lastProjectTitleFallback}
                  </p>
                  <p className="text-xs text-slate-500">
                    {labels.finishedOn}{" "}
                    {new Date(lastFinishedProject.finishedAt).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 rounded-md border border-slate-200 bg-white text-slate-700"
                  >
                    {lastFinishedProject.kind === "service" ? labels.kindService : labels.kindDigitalProduct}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-slate-500">{labels.noData}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200/90 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Store className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {labels.servicesSection}
            </h2>
          </div>
        </div>

        <ServicesListing
          sellerId={seller.id}
          limit={12}
          showCategoryFilter={false}
          showSearch={true}
          showSort={true}
          showSeller={false}
          compact={true}
        />
      </section>
    </div>
  )
}
