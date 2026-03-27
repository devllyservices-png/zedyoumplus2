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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sellerId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const { data: invoices, error } = await supabase
      .from("seller_subscription_invoices")
      .select(
        "id, seller_id, created_at, amount_dzd, duration_months, status, payment_method, payment_proof_url, approved_at, paid_at, rejected_at, period_start_at, period_end_at"
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Failed to fetch seller subscription invoices:", error)
      return NextResponse.json({ error: "فشل في جلب الفواتير" }, { status: 500 })
    }

    // Total count (best-effort; count might be null depending on supabase config)
    const { count } = await supabase
      .from("seller_subscription_invoices")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId)

    return NextResponse.json({
      invoices: invoices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.max(1, Math.ceil((count || 0) / limit)),
      },
    })
  } catch (error) {
    console.error("Admin seller invoices GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

