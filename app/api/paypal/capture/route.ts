import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { capturePayPalOrder } from "@/lib/paypalClient"
import { NotificationTriggers } from "@/lib/notifications"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const body = await request.json()
    const { paypal_order_id, order_id } = body as {
      paypal_order_id?: string
      order_id?: string | number
    }

    if (!paypal_order_id && !order_id) {
      return NextResponse.json(
        { error: "يجب تمرير معرف طلب PayPal أو معرف الطلب الداخلي" },
        { status: 400 }
      )
    }

    // Find internal order
    let orderQuery = supabase
      .from("orders")
      .select(
        `
        id,
        buyer_id,
        seller_id,
        amount,
        paypal_order_id,
        services!orders_service_id_fkey(title),
        digital_products!orders_product_id_fkey(title)
      `
      )
      .limit(1)

    if (order_id) {
      orderQuery = orderQuery.eq("id", order_id)
    } else if (paypal_order_id) {
      orderQuery = orderQuery.eq("paypal_order_id", paypal_order_id)
    }

    const { data: orders, error: orderError } = await orderQuery

    if (orderError || !orders || orders.length === 0) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 })
    }

    const order = orders[0]

    // Optional: ensure the current user is the buyer
    if (order.buyer_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "لا يمكنك إكمال هذا الدفع" }, { status: 403 })
    }

    const effectivePaypalOrderId = paypal_order_id || order.paypal_order_id

    if (!effectivePaypalOrderId) {
      return NextResponse.json(
        { error: "لا يوجد معرف PayPal مرتبط بهذا الطلب" },
        { status: 400 }
      )
    }

    const captureResult = await capturePayPalOrder(effectivePaypalOrderId)
    const newStatus = captureResult.status as string | undefined

    // Update internal order
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus === "COMPLETED" ? "completed" : "pending",
        paypal_status: newStatus || "COMPLETED",
      })
      .eq("id", order.id)

    if (updateError) {
      console.error("Error updating order after PayPal capture:", updateError)
      return NextResponse.json({ error: "فشل في تحديث حالة الطلب بعد الدفع" }, { status: 500 })
    }

    // Trigger payment notification if completed
    if (newStatus === "COMPLETED") {
      try {
        const serviceTitle =
          order.services?.title || order.digital_products?.title || "خدمة غير محددة"

        await NotificationTriggers.onPaymentReceived({
          orderId: order.id,
          buyerId: order.buyer_id,
          sellerId: order.seller_id,
          amount: order.amount,
          serviceTitle,
        })
      } catch (notifError) {
        console.error("Error sending PayPal payment notifications:", notifError)
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      orderId: order.id,
    })
  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تأكيد دفع PayPal" }, { status: 500 })
  }
}

