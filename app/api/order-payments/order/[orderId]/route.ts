import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch (error) {
    return null
  }
}

// GET /api/order-payments/order/[orderId] - Get all payments for a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { orderId } = await params

    // First check if order exists and user has access
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && order.buyer_id !== user.userId && order.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الطلب' }, { status: 403 })
    }

    // Get all payments for this order
    const { data: payments, error } = await supabase
      .from('order_payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'فشل في جلب سجلات الدفع' }, { status: 500 })
    }

    return NextResponse.json({ payments: payments || [] })

  } catch (error) {
    console.error('Order payments GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

