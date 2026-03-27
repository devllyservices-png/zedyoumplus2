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

    return NextResponse.json({
      success: true,
      subscriptionInvoiceId: invoice.id,
    })
  } catch (error) {
    console.error("PayPal subscriptions capture error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تأكيد PayPal" }, { status: 500 })
  }
}

