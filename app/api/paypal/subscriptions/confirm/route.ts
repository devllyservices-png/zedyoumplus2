import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { getPayPalApiBase } from "@/lib/paypalClient"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
const PAYPAL_API_BASE = getPayPalApiBase()

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as string,
    }
  } catch {
    return null
  }
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim()
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error("PayPal environment variables are not configured.")
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const form = new URLSearchParams({
    grant_type: "client_credentials",
  })

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to fetch PayPal access token (confirm):", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal OAuth failed (${res.status}): ${preview}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  const accessToken = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to fetch PayPal subscription details:", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal get subscription failed (${res.status}): ${preview}`)
  }

  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    if (user.role !== "seller") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = (await request.json()) as { paypal_subscription_id?: string }
    const paypal_subscription_id = body?.paypal_subscription_id
    if (!paypal_subscription_id) {
      return NextResponse.json({ error: "paypal_subscription_id مطلوب" }, { status: 400 })
    }

    // Fetch subscription details from PayPal and make sure it is active.
    const subDetails = await getSubscriptionDetails(paypal_subscription_id)
    const status = (subDetails as any)?.status as string | undefined
    const planIdFromPayPal = (subDetails as any)?.plan_id as string | undefined

    if (!status || status.toUpperCase() !== "ACTIVE") {
      return NextResponse.json(
        { error: "حالة اشتراك PayPal ليست ACTIVE بعد" },
        { status: 400 }
      )
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("seller_subscription_invoices")
      .select("id, seller_id, paypal_subscription_id, plan_id")
      .eq("paypal_subscription_id", paypal_subscription_id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "فاتورة غير موجودة" }, { status: 404 })
    }

    if (invoice.seller_id !== user.userId) {
      return NextResponse.json({ error: "غير مصرح بتأكيد هذا الدفع" }, { status: 403 })
    }

    if (invoice.plan_id && planIdFromPayPal) {
      const { data: planRow } = await supabase
        .from("seller_subscription_plans")
        .select("id, paypal_plan_id")
        .eq("id", invoice.plan_id)
        .single()

      if (planRow && planRow.paypal_plan_id && planRow.paypal_plan_id !== planIdFromPayPal) {
        return NextResponse.json(
          { error: "خطة PayPal لا تطابق خطة الاشتراك في النظام" },
          { status: 400 }
        )
      }
    }

    const { error: updateErr } = await supabase
      .from("seller_subscription_invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paypal_status: status || "ACTIVE",
      })
      .eq("id", invoice.id)

    if (updateErr) {
      console.error("Failed to update subscription invoice after PayPal subscription confirm:", updateErr)
      return NextResponse.json({ error: "فشل في تحديث حالة الفاتورة" }, { status: 500 })
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "approve_subscription_invoice",
      {
        p_invoice_id: invoice.id,
      }
    )

    if (rpcError) {
      console.error("approve_subscription_invoice rpc error (from PayPal confirm):", rpcError)
      return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 })
    }

    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult

    return NextResponse.json({
      success: true,
      subscriptionInvoiceId: invoice.id,
      result,
    })
  } catch (error) {
    console.error("PayPal subscriptions confirm error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تأكيد PayPal" }, { status: 500 })
  }
}

