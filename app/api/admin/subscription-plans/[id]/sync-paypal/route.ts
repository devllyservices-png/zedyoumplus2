import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import {
  createPayPalProductForPlan,
  createOrUpdatePayPalBillingPlan,
} from "@/lib/paypalSubscriptions"

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: planId } = await params
    if (!planId) {
      return NextResponse.json({ error: "Missing plan id" }, { status: 400 })
    }

    const { data: plan, error: planError } = await supabase
      .from("seller_subscription_plans")
      .select(
        "id, name, description, price_eur, duration_months, is_active, is_default, paypal_product_id, paypal_plan_id"
      )
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const productResult = await createPayPalProductForPlan(plan)
    const billingPlanResult = await createOrUpdatePayPalBillingPlan({
      ...plan,
      paypal_product_id: productResult.productId,
    })

    const { error: updateError } = await supabase
      .from("seller_subscription_plans")
      .update({
        paypal_product_id: productResult.productId,
        paypal_plan_id: billingPlanResult.planId,
      })
      .eq("id", planId)

    if (updateError) {
      console.error("Failed to store PayPal product/plan IDs:", updateError)
      return NextResponse.json({ error: "Failed to save PayPal identifiers" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paypal_product_id: productResult.productId,
      paypal_plan_id: billingPlanResult.planId,
    })
  } catch (error) {
    console.error("Admin subscription plan sync-paypal POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

