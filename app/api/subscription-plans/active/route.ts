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
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("seller_subscription_plans")
      .select(
        "id, name, description, price_eur, duration_months, is_active, is_default"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to fetch active subscription plans:", error)
      return NextResponse.json({ error: "فشل في جلب خطط الاشتراك" }, { status: 500 })
    }

    return NextResponse.json({
      plans: data || [],
    })
  } catch (error) {
    console.error("Active subscription plans GET error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

