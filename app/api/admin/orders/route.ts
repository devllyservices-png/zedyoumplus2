import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10)
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page
    const safePageSize = Number.isNaN(pageSize) || pageSize < 1 ? 20 : Math.min(pageSize, 100)

    const from = (safePage - 1) * safePageSize
    const to = from + safePageSize - 1

    // Fetch paginated orders with service and user details
    const { data: orders, error: ordersError, count } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        created_at,
        payment_method,
        payment_proof_url,
        additional_notes,
        service_id,
        buyer_id,
        seller_id,
        services!service_id (
          title,
          description,
          seller_id
        ),
        users!buyer_id (
          email
        ),
        sellers:seller_id (
          email,
          profiles!user_id (
            display_name
          )
        )
      `, { count: "exact" })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (ordersError) {
      console.error('Error fetching admin orders:', ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page: safePage,
      pageSize: safePageSize,
    })

  } catch (error) {
    console.error('Error in admin orders API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
