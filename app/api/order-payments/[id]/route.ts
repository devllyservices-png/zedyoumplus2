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

// GET /api/order-payments/[id] - Get payment by ID
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

    const { data: payment, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !payment) {
      return NextResponse.json({ error: 'سجل الدفع غير موجود' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && payment.orders.buyer_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بالوصول لهذا السجل' }, { status: 403 })
    }

    return NextResponse.json({ payment })

  } catch (error) {
    console.error('Payment GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// PATCH /api/order-payments/[id] - Update payment record
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
    const { 
      status, 
      proof_url, 
      phone, 
      wilaya, 
      baladiya, 
      instructions 
    } = body

    // Get existing payment
    const { data: existingPayment, error: fetchError } = await supabase
      .from('order_payments')
      .select(`
        *,
        orders!order_payments_order_id_fkey(
          buyer_id,
          seller_id
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError || !existingPayment) {
      return NextResponse.json({ error: 'سجل الدفع غير موجود' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = user.role === 'admin' || 
                     existingPayment.orders.buyer_id === user.userId ||
                     (existingPayment.orders.seller_id === user.userId && status === 'verified')

    if (!canUpdate) {
      return NextResponse.json({ error: 'غير مصرح بتحديث هذا السجل' }, { status: 403 })
    }

    // Validate status if provided
    if (status && !['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) updateData.status = status
    if (proof_url !== undefined) updateData.proof_url = proof_url
    if (phone !== undefined) updateData.phone = phone
    if (wilaya !== undefined) updateData.wilaya = wilaya
    if (baladiya !== undefined) updateData.baladiya = baladiya
    if (instructions !== undefined) updateData.instructions = instructions

    // Set verification timestamp if status is verified
    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString()
    }

    // Update payment
    const { data: updatedPayment, error: updateError } = await supabase
      .from('order_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return NextResponse.json({ error: 'فشل في تحديث سجل الدفع' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث سجل الدفع بنجاح',
      payment: updatedPayment
    })

  } catch (error) {
    console.error('Payment PATCH error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/order-payments/[id] - Delete payment record (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    // Only admins can delete payment records
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بحذف سجلات الدفع' }, { status: 403 })
    }

    const { id } = await params

    const { error: deleteError } = await supabase
      .from('order_payments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting payment:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف سجل الدفع' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف سجل الدفع بنجاح'
    })

  } catch (error) {
    console.error('Payment DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

