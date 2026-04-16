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

    const { data, error } = await supabase
      .from("seller_subscription_plans")
      .select(
        "id, name, description, price_eur, duration_months, is_active, is_default, paypal_product_id, paypal_plan_id, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to fetch subscription plans:", error)
      return NextResponse.json({ error: "Failed to fetch subscription plans" }, { status: 500 })
    }

    return NextResponse.json({ plans: data || [] })
  } catch (error) {
    console.error("Admin subscription plans GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      plans?: Array<{
        id?: string
        name?: string
        description?: string | null
        price_eur?: number
        duration_months?: number
        is_active?: boolean
        is_default?: boolean
        paypal_product_id?: string | null
        paypal_plan_id?: string | null
        sort_order?: number | null
      }>
    }

    const plans = body?.plans || []
    if (!Array.isArray(plans)) {
      return NextResponse.json({ error: "plans array is required" }, { status: 400 })
    }

    // Normalize default flag: ensure at most one default, prefer the first flagged or fall back to first plan.
    let defaultIndex = plans.findIndex((p) => p.is_default)
    if (defaultIndex === -1 && plans.length > 0) {
      defaultIndex = 0
    }

    const normalized = plans.map((p, index) => ({
      id: p.id && p.id.trim().length > 0 ? p.id : undefined,
      name: (p.name || "").trim(),
      description: p.description ?? null,
      price_eur: typeof p.price_eur === "number" ? p.price_eur : 0.01,
      duration_months:
        typeof p.duration_months === "number" && p.duration_months > 0 ? p.duration_months : 3,
      is_active: p.is_active ?? true,
      is_default: index === defaultIndex,
      paypal_product_id: p.paypal_product_id ?? null,
      paypal_plan_id: p.paypal_plan_id ?? null,
      sort_order: typeof p.sort_order === "number" ? p.sort_order : index,
    }))

    // Basic validation
    for (const plan of normalized) {
      if (!plan.name) {
        return NextResponse.json({ error: "Each plan must have a name" }, { status: 400 })
      }
      if (plan.price_eur <= 0) {
        return NextResponse.json({ error: "Plan price must be greater than 0" }, { status: 400 })
      }
      if (plan.duration_months <= 0) {
        return NextResponse.json(
          { error: "Plan duration_months must be greater than 0" },
          { status: 400 }
        )
      }
    }

    const updates = normalized.filter((p) => Boolean(p.id))
    const inserts = normalized.filter((p) => !p.id)

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from("seller_subscription_plans")
        .upsert(
          updates.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price_eur: p.price_eur,
            duration_months: p.duration_months,
            is_active: p.is_active,
            is_default: p.is_default,
            paypal_product_id: p.paypal_product_id,
            paypal_plan_id: p.paypal_plan_id,
            sort_order: p.sort_order,
          })),
          { onConflict: "id" }
        )

      if (updateError) {
        console.error("Failed to update subscription plans:", updateError)
        return NextResponse.json(
          { error: updateError.message || "Failed to update subscription plans" },
          { status: 500 }
        )
      }
    }

    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from("seller_subscription_plans")
        .insert(
          inserts.map((p) => ({
            name: p.name,
            description: p.description,
            price_eur: p.price_eur,
            duration_months: p.duration_months,
            is_active: p.is_active,
            is_default: p.is_default,
            paypal_product_id: p.paypal_product_id,
            paypal_plan_id: p.paypal_plan_id,
            sort_order: p.sort_order,
          }))
        )

      if (insertError) {
        console.error("Failed to insert subscription plans:", insertError)
        return NextResponse.json(
          { error: insertError.message || "Failed to insert subscription plans" },
          { status: 500 }
        )
      }
    }

    const { data: refreshed, error: refreshError } = await supabase
      .from("seller_subscription_plans")
      .select(
        "id, name, description, price_eur, duration_months, is_active, is_default, paypal_product_id, paypal_plan_id, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (refreshError) {
      console.error("Failed to fetch subscription plans after save:", refreshError)
      return NextResponse.json(
        { error: refreshError.message || "Saved but failed to fetch updated plans" },
        { status: 500 }
      )
    }

    return NextResponse.json({ plans: refreshed || [] })
  } catch (error) {
    console.error("Admin subscription plans POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

