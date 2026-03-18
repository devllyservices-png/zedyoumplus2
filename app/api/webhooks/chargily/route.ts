import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { NotificationTriggers } from "@/lib/notifications"
import { verifySignature } from "@chargily/chargily-pay"

const CHARGILY_SECRET = process.env.CHARGILY_PRIVATE_KEY || ""

export async function POST(request: NextRequest) {
  try {
    if (!CHARGILY_SECRET) {
      console.error("CHARGILY_PRIVATE_KEY is not set; cannot verify Chargily webhooks.")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const signature = request.headers.get("signature") || ""
    if (!signature) {
      console.warn("Chargily webhook called without signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Get raw body for signature verification
    const arrayBuffer = await request.arrayBuffer()
    const rawBody = Buffer.from(arrayBuffer)

    let verified = false
    try {
      verified = verifySignature(rawBody, signature, CHARGILY_SECRET)
    } catch (err) {
      console.error("Error while verifying Chargily signature:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    if (!verified) {
      console.error("Chargily webhook signature verification failed")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const event = JSON.parse(rawBody.toString("utf8"))
    console.log("Chargily webhook event:", event)

    const metadata = (event?.metadata || event?.meta || {}) as any
    const orderId = metadata.order_id

    if (!orderId) {
      console.error("Chargily webhook missing order_id in metadata")
      return NextResponse.json({ error: "Missing order_id in metadata" }, { status: 400 })
    }

    const statusRaw = (event?.status || event?.event || event?.type || "").toString().toLowerCase()
    let newOrderStatus: "pending" | "in_progress" | "completed" | "cancelled" = "pending"

    if (statusRaw.includes("paid") || statusRaw.includes("success")) {
      newOrderStatus = "completed"
    } else if (statusRaw.includes("failed") || statusRaw.includes("cancel")) {
      newOrderStatus = "cancelled"
    }

    // Update order with Chargily status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: newOrderStatus,
        chargily_status: statusRaw || null,
      })
      .eq("id", orderId)
      .select(
        `
        id,
        buyer_id,
        seller_id,
        amount,
        services!orders_service_id_fkey(title),
        digital_products!orders_product_id_fkey(title)
      `
      )
      .single()

    if (updateError) {
      console.error("Error updating order from Chargily webhook:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // For successful payments, trigger payment notification
    if (newOrderStatus === "completed" && updatedOrder) {
      try {
        const serviceTitle =
          updatedOrder.services?.title || updatedOrder.digital_products?.title || "خدمة غير محددة"

        await NotificationTriggers.onPaymentReceived({
          orderId: updatedOrder.id,
          buyerId: updatedOrder.buyer_id,
          sellerId: updatedOrder.seller_id,
          amount: updatedOrder.amount,
          serviceTitle,
        })
      } catch (notificationError) {
        console.error("Error sending payment notifications from Chargily webhook:", notificationError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Chargily webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

