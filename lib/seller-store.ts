import { supabase } from "@/lib/supabaseClient"

export type SellerStoreProfile = {
  display_name: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  phone: string | null
  is_verified: boolean
  rating: number
  completed_orders: number
  member_since: string
  response_time: string | null
  support_rate: string | null
  languages: string[] | null
}

export type SellerStoreService = {
  id: string
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  rating: number
  total_orders: number
  created_at: string
  primary_image: string | null
  min_price: number
  service_packages: Array<{ name: string; price: number; delivery_time: string | null }>
}

export type SellerStoreStats = {
  total_services: number
  total_orders: number
  average_rating: number
  total_reviews: number
  response_time: string
  support_rate: string
}

/**
 * Order-based completion rate (marketplace-style):
 * Denominator = all orders that are no longer `pending`: completed + in_progress + cancelled.
 * Numerator = completed.
 * Rate = 100 * completed / denominator. When denominator is 0, rate is null (show "—").
 */
export type SellerOrderMetrics = {
  projectsCompleted: number
  pendingCount: number
  completedCount: number
  inProgressCount: number
  cancelledCount: number
  /** completed + in_progress + cancelled (excludes pending) */
  nonPendingTotal: number
  completionRatePercent: number | null
}

export type LastFinishedProject = {
  orderId: string
  title: string
  finishedAt: string
  kind: "service" | "product"
}

export type SellerStoreData = {
  seller: {
    id: string
    email: string
    created_at: string
    profile: SellerStoreProfile
  }
  services: SellerStoreService[]
  stats: SellerStoreStats
  orderMetrics: SellerOrderMetrics
  lastFinishedProject: LastFinishedProject | null
}

function finishTimestamp(order: {
  completed_at: string | null
  created_at: string | null
}): number {
  const c = order.completed_at ? new Date(order.completed_at).getTime() : 0
  const cr = order.created_at ? new Date(order.created_at).getTime() : 0
  return Math.max(c, cr)
}

export async function getSellerStoreData(
  sellerId: string
): Promise<SellerStoreData | null> {
  if (!sellerId) return null

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select(
      `
        id,
        email,
        role,
        created_at,
        suspended,
        profiles!inner(
          display_name,
          bio,
          avatar_url,
          location,
          phone,
          is_verified,
          rating,
          completed_orders,
          member_since,
          response_time,
          support_rate,
          languages
        )
      `
    )
    .eq("id", sellerId)
    .eq("role", "seller")
    .eq("suspended", false)
    .maybeSingle()

  if (userError || !userRow) return null

  const profile = userRow.profiles[0] as SellerStoreProfile

  // Subscription gating: only show store/services for sellers with an active approved subscription.
  const now = new Date()
  const { data: activeSub, error: activeSubErr } = await supabase
    .from("seller_subscriptions")
    .select("id, ends_at")
    .eq("seller_id", sellerId)
    .gt("ends_at", now.toISOString())
    .order("ends_at", { ascending: false })
    .limit(1)

  if (activeSubErr) {
    console.error("getSellerStoreData active subscription check error:", activeSubErr)
    return null
  }

  if (!activeSub || activeSub.length === 0) {
    return null
  }

  const { data: servicesRaw, error: servicesError } = await supabase
    .from("services")
    .select(
      `
        id,
        title,
        description,
        category,
        tags,
        rating,
        total_orders,
        created_at,
        service_images(image_url, is_primary),
        service_packages(name, price, delivery_time)
      `
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (servicesError) {
    console.error("getSellerStoreData services:", servicesError)
  }

  const servicesList = servicesRaw || []
  const totalServices = servicesList.length
  const totalOrdersSum = servicesList.reduce(
    (sum, s) => sum + (s.total_orders || 0),
    0
  )

  const servicesWithRatings = servicesList.filter((s) => Number(s.rating) > 0)
  const averageRating =
    servicesWithRatings.length > 0
      ? servicesWithRatings.reduce((sum, s) => sum + Number(s.rating), 0) /
        servicesWithRatings.length
      : 0

  const serviceIds = servicesList.map((s) => s.id)
  let totalReviews = 0
  if (serviceIds.length > 0) {
    const { data: reviews } = await supabase
      .from("service_reviews")
      .select("id")
      .in("service_id", serviceIds)
    totalReviews = reviews?.length ?? 0
  }

  const formattedServices: SellerStoreService[] = servicesList.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    category: service.category,
    tags: service.tags,
    rating: Number(service.rating) || 0,
    total_orders: service.total_orders || 0,
    created_at: service.created_at,
    primary_image:
      service.service_images?.find((img: { is_primary?: boolean }) => img.is_primary)
        ?.image_url ||
      service.service_images?.[0]?.image_url ||
      null,
    min_price:
      service.service_packages?.length > 0
        ? Math.min(
            ...service.service_packages.map((p: { price: number }) => Number(p.price))
          )
        : 0,
    service_packages: (service.service_packages || []).map(
      (p: { name: string; price: number; delivery_time: string | null }) => ({
        name: p.name,
        price: Number(p.price),
        delivery_time: p.delivery_time,
      })
    ),
  }))

  const { data: ordersRows } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      completed_at,
      created_at,
      service_id,
      product_id,
      services(title),
      digital_products(title)
    `
    )
    .eq("seller_id", sellerId)

  const orders = ordersRows || []
  let completedCount = 0
  let inProgressCount = 0
  let cancelledCount = 0
  let pendingCount = 0

  for (const o of orders) {
    switch (o.status) {
      case "completed":
        completedCount++
        break
      case "in_progress":
        inProgressCount++
        break
      case "cancelled":
        cancelledCount++
        break
      case "pending":
        pendingCount++
        break
      default:
        break
    }
  }

  const nonPendingTotal = completedCount + inProgressCount + cancelledCount
  const completionRatePercent =
    nonPendingTotal === 0
      ? null
      : Math.round((100 * completedCount) / nonPendingTotal)

  const completedOrders = orders.filter((o) => o.status === "completed")
  completedOrders.sort((a, b) => finishTimestamp(b) - finishTimestamp(a))
  const last = completedOrders[0]

  let lastFinishedProject: LastFinishedProject | null = null
  if (last) {
    const svc = last.services as { title?: string } | null
    const prod = last.digital_products as { title?: string } | null
    const title = svc?.title || prod?.title || "طلب مكتمل"
    const finishedAt =
      last.completed_at ||
      last.created_at ||
      new Date().toISOString()
    lastFinishedProject = {
      orderId: last.id,
      title,
      finishedAt,
      kind: last.service_id ? "service" : "product",
    }
  }

  const orderMetrics: SellerOrderMetrics = {
    projectsCompleted: completedCount,
    pendingCount,
    completedCount,
    inProgressCount,
    cancelledCount,
    nonPendingTotal,
    completionRatePercent,
  }

  return {
    seller: {
      id: userRow.id,
      email: userRow.email,
      created_at: userRow.created_at,
      profile,
    },
    services: formattedServices,
    stats: {
      total_services: totalServices,
      total_orders: totalOrdersSum,
      average_rating: Math.round(averageRating * 10) / 10,
      total_reviews: totalReviews,
      response_time: profile.response_time || "غير محدد",
      support_rate: profile.support_rate || "غير محدد",
    },
    orderMetrics,
    lastFinishedProject,
  }
}
