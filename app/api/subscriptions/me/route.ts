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
    if (!user) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }

    const now = new Date()
    const { data: activePeriodRows, error: activeError } = await supabase
      .from("seller_subscriptions")
      .select("id, seller_id, invoice_id, starts_at, ends_at")
      .eq("seller_id", user.userId)
      .gt("ends_at", now.toISOString())
      .order("ends_at", { ascending: false })
      .limit(1)

    if (activeError) {
      console.error("Failed to fetch active seller subscription:", activeError)
    }

    // Supabase returns an array here; same row shape as admin GET /api/admin/sellers/subscriptions
    const activePeriod = activePeriodRows?.[0] ?? null

    const { data: invoicesRows, error: invoicesError } = await supabase
      .from("seller_subscription_invoices")
      .select(
        "id, seller_id, amount_dzd, duration_months, status, payment_method, payment_proof_url, phone, wilaya, baladiya, instructions, chargily_checkout_id, paypal_order_id, period_start_at, period_end_at, approved_at, paid_at, created_at"
      )
      .eq("seller_id", user.userId)
      .order("created_at", { ascending: false })
      .limit(30)

    if (invoicesError) {
      console.error("Failed to fetch seller subscription invoices:", invoicesError)
      return NextResponse.json({ error: "فشل في جلب الفواتير" }, { status: 500 })
    }

    // Pending invoice = paid or pending, but not approved/rejected.
    const pendingInvoice = (invoicesRows || []).find(
      (inv) => inv.status === "pending" || inv.status === "paid"
    )

    return NextResponse.json({
      activeSubscription: activePeriod
        ? {
            periodId: activePeriod.id,
            invoiceId: activePeriod.invoice_id,
            startsAt: activePeriod.starts_at,
            endsAt: activePeriod.ends_at,
          }
        : null,
      pendingInvoice: pendingInvoice
        ? {
            id: pendingInvoice.id,
            status: pendingInvoice.status,
            amountDzd: Number(pendingInvoice.amount_dzd),
            paymentMethod: pendingInvoice.payment_method,
            createdAt: pendingInvoice.created_at,
            paymentProofUrl: pendingInvoice.payment_proof_url,
            paidAt: pendingInvoice.paid_at,
          }
        : null,
      invoices: (invoicesRows || []).map((inv) => ({
        id: inv.id,
        createdAt: inv.created_at,
        amountDzd: Number(inv.amount_dzd),
        durationMonths: inv.duration_months,
        status: inv.status,
        paymentMethod: inv.payment_method,
        paymentProofUrl: inv.payment_proof_url,
        periodStartAt: inv.period_start_at,
        periodEndAt: inv.period_end_at,
        approvedAt: inv.approved_at,
        paidAt: inv.paid_at,
      })),
    })
  } catch (error) {
    console.error("Subscriptions me GET error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

