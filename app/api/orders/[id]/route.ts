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

// GET /api/orders/[id] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { id } = await params

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        services!orders_service_id_fkey(
          id,
          title,
          description,
          category,
          service_images(image_url, is_primary),
          service_packages(id, name, price, delivery_time, revisions, features)
        ),
        service_packages!orders_package_id_fkey(
          id,
          name,
          price,
          delivery_time,
          revisions,
          features
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          profiles!inner(display_name, avatar_url, phone)
        ),
        seller:users!orders_seller_id_fkey(
          id,
          profiles!inner(display_name, avatar_url, is_verified, phone)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check if user has permission to view this order
    if (user.role !== 'admin' && order.buyer_id !== user.userId && order.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذا الطلب' }, { status: 403 })
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'حالة غير صحيحة' 
      }, { status: 400 })
    }

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = user.role === 'admin' || 
                     (status === 'cancelled' && order.buyer_id === user.userId) ||
                     (['in_progress', 'completed'].includes(status) && order.seller_id === user.userId)

    if (!canUpdate) {
      return NextResponse.json({ 
        error: 'غير مصرح بتحديث حالة هذا الطلب' 
      }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }

    // Set completion time if status is completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'فشل في تحديث الطلب' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الطلب بنجاح',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order PATCH error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Cancel order (buyer only, if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { id } = await params

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check permissions - only buyer can cancel pending orders
    if (user.role !== 'admin' && 
        (order.buyer_id !== user.userId || order.status !== 'pending')) {
      return NextResponse.json({ 
        error: 'يمكن إلغاء الطلبات المعلقة فقط' 
      }, { status: 403 })
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling order:', updateError)
      return NextResponse.json({ error: 'فشل في إلغاء الطلب' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

