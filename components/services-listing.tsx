"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Price } from "@/components/price"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

import { Search, Star, Clock, ShoppingCart, Shield, ChevronLeft, ChevronRight } from "lucide-react"

type ServiceCard = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  tags?: string[] | null
  average_rating: number
  reviews_count: number
  total_orders: number
  primary_image: string | null
  service_packages?: Array<{
    id?: string
    name: string
    price: number
    delivery_time?: string | null
  }> | null
  seller_profile?: {
    display_name?: string | null
    avatar_url?: string | null
    is_verified?: boolean | null
    rating?: number | null
    completed_orders?: number | null
    response_time?: string | null
  } | null
}

export type ServicesListingProps = {
  sellerId?: string
  category?: string
  limit?: number

  showSearch?: boolean
  showSort?: boolean
  showCategoryFilter?: boolean
  showSeller?: boolean

  /** Optional seed values (also read from URL query when present). */
  initialSearch?: string
  initialSortBy?: string
  initialCategory?: string

  /** Smaller toolbar/card spacing for embedded locations (store/profile). */
  compact?: boolean
}

export default function ServicesListing({
  sellerId,
  category,
  limit = 24,
  showSearch = true,
  showSort = true,
  showCategoryFilter,
  showSeller = true,
  initialSearch,
  initialSortBy,
  initialCategory,
  compact = false,
}: ServicesListingProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const resolvedShowCategoryFilter =
    showCategoryFilter ?? (!category && !sellerId ? true : !category)

  const [searchDraft, setSearchDraft] = useState(initialSearch || "")
  const [search, setSearch] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || category || "all"
  )
  const [sortBy, setSortBy] = useState(initialSortBy || "newest")
  const [currentPage, setCurrentPage] = useState(1)

  const categories = useMemo(
    () => [
      { value: "all", label: t.servicesPage.categories.all },
      { value: "design", label: t.servicesPage.categories.design },
      { value: "programming", label: t.servicesPage.categories.programming },
      { value: "translation", label: t.servicesPage.categories.translation },
      { value: "marketing", label: t.servicesPage.categories.marketing },
      { value: "education", label: t.servicesPage.categories.education },
      { value: "audio", label: t.servicesPage.categories.audio },
      { value: "photography", label: t.servicesPage.categories.photography },
      { value: "illustration", label: t.servicesPage.categories.illustration },
      { value: "mobile", label: t.servicesPage.categories.mobile },
      { value: "seo", label: t.servicesPage.categories.seo },
      { value: "content", label: t.servicesPage.categories.content },
      { value: "video", label: t.servicesPage.categories.video },
    ],
    [t.servicesPage.categories]
  )

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t.servicesPage.sortOptions.newest },
      { value: "oldest", label: t.servicesPage.sortOptions.oldest },
      { value: "rating", label: t.servicesPage.sortOptions.rating },
      { value: "price-low", label: t.servicesPage.sortOptions.priceLow },
      { value: "price-high", label: t.servicesPage.sortOptions.priceHigh },
      { value: "orders", label: t.servicesPage.sortOptions.orders },
    ],
    [t.servicesPage.sortOptions]
  )

  // Initialize seeds from URL query (if present) after mount.
  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    const qSearch = sp.get("search")
    const qCategory = sp.get("category")
    const qSort = sp.get("sort")

    if (qSearch != null) {
      setSearchDraft(qSearch)
      setSearch(qSearch)
    }
    if (qCategory != null && !category) {
      setSelectedCategory(qCategory || "all")
    }
    if (qSort != null) {
      setSortBy(qSort)
    }

    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [services, setServices] = useState<ServiceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string>("")
  const [totalServices, setTotalServices] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const effectiveLimit = limit > 20 ? 20 : limit

  // Debounce search input to reduce requests.
  useEffect(() => {
    const h = window.setTimeout(() => {
      setSearch(searchDraft)
      setCurrentPage(1)
    }, 400)
    return () => window.clearTimeout(h)
  }, [searchDraft])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, sortBy, sellerId, category])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (currentPage === 1) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError("")

        const params = new URLSearchParams()
        params.append("page", currentPage.toString())
        params.append("limit", effectiveLimit.toString())

        if (sellerId) params.append("seller_id", sellerId)

        const effectiveCategory = category || selectedCategory
        if (effectiveCategory && effectiveCategory !== "all") {
          params.append("category", effectiveCategory)
        }

        if (search?.trim()) params.append("search", search.trim())

        if (sortBy) params.append("sort", sortBy)

        const res = await fetch(`/api/services?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data?.error || t.servicesPage.grid.noResults)
          if (currentPage === 1) setServices([])
          setTotalServices(0)
          setTotalPages(1)
          return
        }

        const list: ServiceCard[] = data.services || []

        const apiTotal = data.pagination?.total
        const derivedTotal = typeof apiTotal === "number" ? apiTotal : list.length
        const pages = Math.max(1, Math.ceil(derivedTotal / effectiveLimit))
        setTotalServices(derivedTotal)
        setTotalPages(pages)

        setServices((prev) => {
          if (currentPage === 1) return list
          const merged = [...prev, ...list]
          const seen = new Set<string>()
          const unique: ServiceCard[] = []
          for (const item of merged) {
            if (!item?.id) continue
            if (seen.has(item.id)) continue
            seen.add(item.id)
            unique.push(item)
          }
          return unique
        })
      } catch (e: any) {
        setError(e?.message || t.services.failedToLoad)
      } finally {
        if (currentPage === 1) {
          setLoading(false)
          setLoadingMore(false)
        } else {
          setLoadingMore(false)
        }
      }
    }

    fetchServices()
    // Intentionally include only dependencies that should re-fetch:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, category, selectedCategory, search, sortBy, currentPage, limit, t.servicesPage.grid.noResults, t.services.failedToLoad])

  const applyCategory = (v: string) => {
    // If category is fixed via props, don't change it.
    if (category) return
    setSelectedCategory(v)
  }

  const spacing = compact ? "space-y-3" : "space-y-6"
  const toolbarPadding = compact ? "p-2.5" : "p-3 sm:p-4"
  const gridGap = compact ? "gap-3" : "gap-6"
  const toolbarCardClass = compact
    ? "border border-slate-200/90 bg-white shadow-sm"
    : "border-0 shadow-xl bg-white/80 backdrop-blur-sm"
  const listingCardClass = compact
    ? "border border-slate-200/90 bg-white shadow-sm hover:border-slate-300/80 hover:shadow-md transition-all duration-300 ease-out"
    : "border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ease-in-out"
  const skeletonCardClass = compact
    ? "overflow-hidden border border-slate-200/90 bg-white shadow-sm"
    : "overflow-hidden border-0 shadow-xl bg-white/60"

  const enableLoadMore = totalServices > 20
  const canLoadMore = enableLoadMore && services.length < totalServices && currentPage < totalPages

  return (
    <div className={spacing}>
      {(showSearch || showSort || resolvedShowCategoryFilter) && (
        <Card className={toolbarCardClass}>
          <CardContent className={toolbarPadding}>
            <div className={`flex flex-col ${compact ? "gap-3" : "gap-4"} sm:flex-row sm:items-center`}>
              {showSearch && (
                <div className={`${compact ? "flex-1" : "flex-1"} relative`}>
                  <Search
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${compact ? "text-slate-400" : "text-gray-400"}`}
                  />
                  <Input
                    placeholder={t.servicesPage.searchPlaceholder}
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    className={`pr-10 ${compact ? "h-11 border-slate-200/90 bg-slate-50/50 focus-visible:ring-indigo-500/30" : "h-12"}`}
                  />
                </div>
              )}

              {resolvedShowCategoryFilter && (
                <div className={showSearch ? "mt-3 sm:mt-0 sm:ml-3 sm:flex-1" : "flex-1 mt-3 sm:mt-0"}>
                  <Select
                    value={category ? category : selectedCategory}
                    onValueChange={applyCategory}
                    disabled={!!category}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t.servicesPage.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showSort && (
                <div className={showSearch || resolvedShowCategoryFilter ? "mt-3 sm:mt-0 sm:ml-3 sm:flex-1" : "flex-1 mt-3 sm:mt-0"}>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t.servicesPage.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gridGap}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className={skeletonCardClass}>
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="px-4 pb-4 pt-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.refresh()}>
            {t.servicesPage.grid.retry}
          </Button>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t.servicesPage.grid.noResults}</p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-500 ease-in-out ${gridGap}`}>
            {services.map((service, index) => {
              const packages = service.service_packages || []
              const firstPackage = packages?.[0]
              const prices = packages
                .map((p) => Number(p?.price))
                .filter((n) => Number.isFinite(n) && n > 0)
              const price = prices.length ? Math.min(...prices) : 0
              const delivery = firstPackage?.delivery_time || t.services.deliveryTime
              const seller = service.seller_profile

              return (
                <Link
                  key={service.id ?? index}
                  href={`/services/${service.id}`}
                  className="block"
                >
                  <Card
                    className={`group h-full flex flex-col overflow-hidden pt-0 cursor-pointer ${listingCardClass}`}
                  >
                    <div className="relative">
                      <Image
                        src={service.primary_image || "/placeholder.svg"}
                        alt={service.title}
                        width={300}
                        height={250}
                        className="w-full h-56 object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />

                      {service.category && (
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={
                              compact
                                ? "border-0 bg-slate-900/85 text-white backdrop-blur-sm"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                            }
                          >
                            {service.category}
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{service.average_rating.toFixed(1)}</span>
                      </div>

                      <div
                        className={
                          compact
                            ? "absolute bottom-3 right-3 rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm"
                            : "absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
                        }
                      >
                        {t.services.startingFrom}{" "}
                        {price > 0 ? <Price amountDzd={price} /> : t.services.currency}
                      </div>
                    </div>

                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col flex-1">
                      <div className="min-h-[3.1rem] mb-3">
                        <h3
                          className={
                            compact
                              ? "text-base sm:text-lg font-semibold text-slate-900 line-clamp-2 transition-colors group-hover:text-indigo-700"
                              : "text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 transition-colors group-hover:text-blue-600"
                          }
                        >
                          {service.title}
                        </h3>
                      </div>

                      {!compact && (
                        <div className="flex flex-wrap gap-1 mb-3 min-h-[1.75rem]">
                          {(service.tags || []).slice(0, 3).map((tag, i) => (
                            <Badge
                              key={`${tag}-${i}`}
                              variant="secondary"
                              className="text-xs bg-gray-100 hover:bg-gray-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(service.tags?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100">
                              +{(service.tags?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {showSeller && !compact ? (
                        <div className="mb-4 min-h-[4.6rem]">
                          {seller ? (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg h-full">
                              <div className="relative w-10 h-10">
                                <Image
                                  src={seller.avatar_url || "/images/avatar-fallback.svg"}
                                  alt={seller.display_name || "Seller"}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">
                                    {seller.display_name || t.services.seller}
                                  </span>
                                  {seller.is_verified && (
                                    <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  )}
                                  {seller.is_verified && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-green-100 text-green-800 flex-shrink-0"
                                    >
                                      {t.services.verified}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span>{seller.rating?.toFixed(1) || "0.0"}</span>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {seller.completed_orders || 0} {t.services.order}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-sm text-gray-600 mt-auto">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{delivery}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          <span>{service.total_orders}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Pagination vs Load more */}
          {enableLoadMore ? (
            <div className="flex items-center justify-center mt-8">
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!canLoadMore || loadingMore}
                variant="outline"
                className="bg-white/90 hover:bg-white border-gray-200"
              >
                {loadingMore ? t.services.retry : "Load more"}
              </Button>
            </div>
          ) : (
            totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white border-gray-200"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronRight className="w-4 h-4 mr-1" />
                  {t.servicesPage.grid.prev}
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1
                    const isActive = pageNum === currentPage
                    return (
                      <button
                        key={pageNum}
                        className={`w-9 h-9 rounded-full text-sm font-medium cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white border-gray-200"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  {t.servicesPage.grid.next}
                  <ChevronLeft className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

