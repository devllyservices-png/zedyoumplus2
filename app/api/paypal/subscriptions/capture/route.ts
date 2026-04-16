import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { capturePayPalOrder } from "@/lib/paypalClient"

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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    if (user.role !== "seller") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const body = (await request.json()) as { paypal_order_id?: string }
    const paypal_order_id = body?.paypal_order_id
    if (!paypal_order_id) {
      return NextResponse.json({ error: "paypal_order_id مطلوب" }, { status: 400 })
    }

    // Capture first (so we trust PayPal as the source of truth for paid state).
    const captureResult = await capturePayPalOrder(paypal_order_id)
    const status = (captureResult as any)?.status as string | undefined

    const { data: invoice, error: invoiceError } = await supabase
      .from("seller_subscription_invoices")
      .select("id, seller_id, paypal_order_id")
      .eq("paypal_order_id", paypal_order_id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "فاتورة غير موجودة" }, { status: 404 })
    }

    if (invoice.seller_id !== user.userId) {
      return NextResponse.json({ error: "غير مصرح بتأكيد هذا الدفع" }, { status: 403 })
    }

    const { error: updateErr } = await supabase
      .from("seller_subscription_invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paypal_status: status || "COMPLETED",
      })
      .eq("id", invoice.id)

    if (updateErr) {
      console.error("Failed to update subscription invoice after PayPal capture:", updateErr)
      return NextResponse.json({ error: "فشل في تحديث حالة الفاتورة" }, { status: 500 })
    }

    // Manual renewal flow: once paid, activate/extend immediately.
    const { data: approveResult, error: approveError } = await supabase.rpc(
      "approve_subscription_invoice",
      {
        p_invoice_id: invoice.id,
      }
    )

    if (approveError) {
      // Fallback: activate manually if RPC is unavailable.
      console.error("approve_subscription_invoice rpc error (from PayPal capture):", approveError)

      const { data: invForFallback, error: invFallbackError } = await supabase
        .from("seller_subscription_invoices")
        .select("id, seller_id, duration_months")
        .eq("id", invoice.id)
        .single()

      if (invFallbackError || !invForFallback) {
        return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 })
      }

      const { data: latestSub } = await supabase
        .from("seller_subscriptions")
        .select("id, ends_at")
        .eq("seller_id", invForFallback.seller_id)
        .order("ends_at", { ascending: false })
        .limit(1)

      const now = new Date()
      const latestEnd = latestSub?.[0]?.ends_at ? new Date(latestSub[0].ends_at) : null
      const start = latestEnd && latestEnd.getTime() > now.getTime() ? latestEnd : now
      const end = new Date(start)
      end.setMonth(end.getMonth() + Math.max(1, Number(invForFallback.duration_months || 1)))

      const { error: subInsertError } = await supabase.from("seller_subscriptions").insert({
        seller_id: invForFallback.seller_id,
        invoice_id: invForFallback.id,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
      })

      if (subInsertError) {
        console.error("Fallback subscription insert failed:", subInsertError)
        return NextResponse.json({ error: "فشل في تفعيل الاشتراك" }, { status: 500 })
      }

      await supabase
        .from("seller_subscription_invoices")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          period_start_at: start.toISOString(),
          period_end_at: end.toISOString(),
        })
        .eq("id", invForFallback.id)

      return NextResponse.json({
        success: true,
        subscriptionInvoiceId: invForFallback.id,
      })
    }

    return NextResponse.json({
      success: true,
      subscriptionInvoiceId: invoice.id,
      result: Array.isArray(approveResult) ? approveResult[0] : approveResult,
    })
  } catch (error) {
    console.error("PayPal subscriptions capture error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تأكيد PayPal" }, { status: 500 })
  }
}

