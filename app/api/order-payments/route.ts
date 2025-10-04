import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { NotificationTriggers } from "@/lib/notifications"

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

// POST /api/order-payments - Create a payment record
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      order_id, 
      method, 
      proof_url, 
      phone, 
      wilaya, 
      baladiya, 
      instructions 
    } = body

    // Validate required fields
    if (!order_id || !method) {
      return NextResponse.json({ 
        error: 'معرف الطلب وطريقة الدفع مطلوبان' 
      }, { status: 400 })
    }

    // Validate method
    const validMethods = ['edahabia', 'bank_transfer', 'baridi_mob', 'cash']
    if (!validMethods.includes(method)) {
      return NextResponse.json({ 
        error: 'طريقة دفع غير صحيحة' 
      }, { status: 400 })
    }

    // Check if order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        buyer_id, 
        seller_id,
        amount,
        services!orders_service_id_fkey(title),
        digital_products!orders_product_id_fkey(title)
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (order.buyer_id !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الطلب' }, { status: 403 })
    }

    // Method-specific validation
    if (method === 'bank_transfer' && !proof_url) {
      return NextResponse.json({ 
        error: 'إثبات الحوالة البنكية مطلوب' 
      }, { status: 400 })
    }

    if (method === 'baridi_mob' && !proof_url) {
      return NextResponse.json({ 
        error: 'إثبات الدفع عبر BaridiMob مطلوب' 
      }, { status: 400 })
    }

    if (method === 'cash' && (!phone || !wilaya || !baladiya)) {
      return NextResponse.json({ 
        error: 'رقم الهاتف والولاية والبلدية مطلوبة للدفع النقدي' 
      }, { status: 400 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('order_payments')
      .insert({
        order_id,
        method,
        proof_url: proof_url || null,
        phone: phone || null,
        wilaya: wilaya || null,
        baladiya: baladiya || null,
        instructions: instructions || null,
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      return NextResponse.json({ error: 'فشل في إنشاء سجل الدفع' }, { status: 500 })
    }

    // Trigger notification for payment received
    try {
      const serviceTitle = order.services?.title || order.digital_products?.title || 'خدمة غير محددة'
      
      await NotificationTriggers.onPaymentReceived({
        orderId: parseInt(order_id),
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        amount: order.amount,
        serviceTitle
      })
    } catch (notificationError) {
      console.error('Error sending notification for payment:', notificationError)
      // Don't fail the payment creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء سجل الدفع بنجاح',
      payment
    })

  } catch (error) {
    console.error('Order payments POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// GET /api/order-payments - Get payments for user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    let query = supabase
      .from('order_payments')
      .select(`
        *,
        orders!order_payments_order_id_fkey(
          id,
          buyer_id,
          seller_id,
          amount,
          status,
          services!orders_service_id_fkey(title)
        )
      `)

    if (orderId) {
      // Get payments for specific order
      query = query.eq('order_id', orderId)
    } else {
      // Get all payments for user's orders
      query = query.eq('orders.buyer_id', user.userId)
    }

    query = query.order('created_at', { ascending: false })

    const { data: payments, error } = await query

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

