import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== 'seller') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orderId = params.id

    // First, verify that this order belongs to the seller
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, seller_id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.seller_id !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (order.status !== 'in_progress') {
      return NextResponse.json({ error: "Order must be in progress to mark as completed" }, { status: 400 })
    }

    // Update the order status to completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order marked as completed successfully" 
    })

  } catch (error) {
    console.error('Error in complete order API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
