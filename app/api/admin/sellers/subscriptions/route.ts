import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId as string, email: decoded.email as string, role: decoded.role as string }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    const { data: sellers, error: sellersError } = await supabase
      .from("users")
      .select("id, email, created_at, suspended, profiles!inner(display_name, avatar_url)")
      .eq("role", "seller")
      .eq("suspended", false)
      .order("created_at", { ascending: false })

    if (sellersError) {
      console.error("Failed to fetch sellers:", sellersError)
      return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 })
    }

    const results = await Promise.all(
      (sellers || []).map(async (seller: any) => {
        const sid = seller.id as string

        const { data: activePeriod } = await supabase
          .from("seller_subscriptions")
          .select("id, invoice_id, starts_at, ends_at")
          .eq("seller_id", sid)
          .gt("ends_at", now.toISOString())
          .order("ends_at", { ascending: false })
          .limit(1)

        const { data: latestPeriod } = await supabase
          .from("seller_subscriptions")
          .select("id, invoice_id, starts_at, ends_at")
          .eq("seller_id", sid)
          .order("ends_at", { ascending: false })
          .limit(1)

        const { data: pendingInv } = await supabase
          .from("seller_subscription_invoices")
          .select("id")
          .eq("seller_id", sid)
          .in("status", ["pending", "paid"])
          .order("created_at", { ascending: false })
          .limit(1)

        return {
          sellerId: sid,
          email: seller.email,
          displayName: seller.profiles?.display_name ?? null,
          avatarUrl: seller.profiles?.avatar_url ?? null,
          isActive: (activePeriod || []).length > 0,
          activeEndsAt: (activePeriod?.[0] as any)?.ends_at ?? null,
          latestEndsAt: (latestPeriod?.[0] as any)?.ends_at ?? null,
          hasPendingInvoice: (pendingInv || []).length > 0,
        }
      })
    )

    return NextResponse.json({ sellers: results })
  } catch (error) {
    console.error("Admin sellers subscriptions GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

