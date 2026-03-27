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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit
    const status = searchParams.get("status") || null

    let query = supabase
      .from("seller_subscription_invoices")
      .select(
        "id, seller_id, created_at, amount_dzd, duration_months, status, payment_method, payment_proof_url, approved_at, paid_at, rejected_at, period_start_at, period_end_at"
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: invoices, error } = await query
    if (error) {
      console.error("Failed to fetch subscription invoices:", error)
      return NextResponse.json({ error: "فشل في جلب الفواتير" }, { status: 500 })
    }

    let countQuery = supabase
      .from("seller_subscription_invoices")
      .select("id", { count: "exact", head: true })

    if (status) {
      countQuery = countQuery.eq("status", status)
    }

    const { count } = await countQuery

    const sellerIds = Array.from(new Set((invoices || []).map((i: any) => i.seller_id)))
    let sellerMeta: Record<string, { email: string | null; displayName: string | null; avatarUrl: string | null }> = {}
    if (sellerIds.length > 0) {
      const { data: sellers } = await supabase
        .from("users")
        .select("id, email, profiles!inner(display_name, avatar_url)")
        .in("id", sellerIds)

      sellerMeta = (sellers || []).reduce((acc: any, s: any) => {
        acc[s.id] = {
          email: s.email ?? null,
          displayName: s.profiles?.display_name ?? null,
          avatarUrl: s.profiles?.avatar_url ?? null,
        }
        return acc
      }, {})
    }

    const invoicesWithSeller = (invoices || []).map((inv: any) => ({
      ...inv,
      seller: {
        id: inv.seller_id,
        email: sellerMeta[inv.seller_id]?.email ?? null,
        displayName: sellerMeta[inv.seller_id]?.displayName ?? null,
        avatarUrl: sellerMeta[inv.seller_id]?.avatarUrl ?? null,
      },
    }))

    return NextResponse.json({
      invoices: invoicesWithSeller,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.max(1, Math.ceil((count || 0) / limit)),
      },
    })
  } catch (error) {
    console.error("Admin subscription invoices GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

