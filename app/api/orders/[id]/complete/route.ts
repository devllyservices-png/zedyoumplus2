import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { NotificationTriggers } from "@/lib/notifications"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "seller") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: orderId } = await params

    // First, verify that this order belongs to the seller
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id, 
        seller_id, 
        buyer_id,
        status,
        services!orders_service_id_fkey(title),
        digital_products!orders_product_id_fkey(title)
      `
      )
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.seller_id !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (order.status !== "in_progress") {
      return NextResponse.json({ error: "Order must be in progress to mark as completed" }, { status: 400 })
    }

    const completedAt = new Date().toISOString()

    // Update the order status to completed and record completion time (aligns with PATCH /api/orders/[id])
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed", completed_at: completedAt })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order status:", updateError)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    // Trigger notification for order completion
    try {
      const services = order.services as { title?: string } | { title?: string }[] | null
      const products = order.digital_products as { title?: string } | { title?: string }[] | null
      const serviceTitle =
        (Array.isArray(services) ? services[0]?.title : services?.title) ||
        (Array.isArray(products) ? products[0]?.title : products?.title) ||
        "خدمة غير محددة"

      await NotificationTriggers.onOrderStatusChange({
        orderId: parseInt(orderId, 10),
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        newStatus: "completed",
        serviceTitle,
      })
    } catch (notificationError) {
      console.error("Error sending notification for order completion:", notificationError)
      // Don't fail the order completion if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as completed successfully",
    })
  } catch (error) {
    console.error("Error in complete order API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
