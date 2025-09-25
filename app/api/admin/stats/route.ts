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

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total buyers
    const { count: totalBuyers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'buyer')

    // Get total sellers
    const { count: totalSellers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'seller')

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total revenue (sum of all completed orders)
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'completed')

    const totalRevenue = completedOrders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalBuyers: totalBuyers || 0,
      totalSellers: totalSellers || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
