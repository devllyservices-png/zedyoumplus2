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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get order details for notification
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        seller_id,
        services!orders_service_id_fkey(title),
        digital_products!orders_product_id_fkey(title)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Validate that buyer and seller exist in users table
    const { data: buyerExists } = await supabase
      .from('users')
      .select('id')
      .eq('id', order.buyer_id)
      .single()

    const { data: sellerExists } = await supabase
      .from('users')
      .select('id')
      .eq('id', order.seller_id)
      .single()

    if (!buyerExists || !sellerExists) {
      console.error('Invalid user IDs in order:', {
        orderId,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        buyerExists: !!buyerExists,
        sellerExists: !!sellerExists
      })
      return NextResponse.json({ error: "Invalid user IDs in order" }, { status: 400 })
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    // Trigger notification for status change
    try {
      const serviceTitle = order.services?.title || order.digital_products?.title || 'خدمة غير محددة'
      
      console.log('=== ADMIN ORDER STATUS CHANGE ===')
      console.log('Order ID:', orderId)
      console.log('New Status:', status)
      console.log('Buyer ID:', order.buyer_id)
      console.log('Seller ID:', order.seller_id)
      console.log('Service Title:', serviceTitle)
      console.log('================================')
      
      await NotificationTriggers.onOrderStatusChange({
        orderId: parseInt(orderId),
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        newStatus: status,
        serviceTitle
      })
      
      console.log('Notifications sent successfully')
    } catch (notificationError) {
      console.error('Error sending notification for order status change:', notificationError)
      // Don't fail the status update if notifications fail
    }

    return NextResponse.json({ success: true, message: "Order status updated successfully" })

  } catch (error) {
    console.error('Error in update order status API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
