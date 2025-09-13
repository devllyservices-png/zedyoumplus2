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

// PUT /api/service-faq/[id] - Update service FAQ (seller or admin)
export async function PUT(
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
    const { question, answer } = body

    // Check if FAQ exists and user has permission
    const { data: faq, error: fetchError } = await supabase
      .from('service_faq')
      .select(`
        id,
        service_id,
        services!inner(seller_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !faq) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && faq.services.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بتعديل هذا السؤال' }, { status: 403 })
    }

    // Update FAQ
    const { data: updatedFaq, error: updateError } = await supabase
      .from('service_faq')
      .update({
        question,
        answer,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating FAQ:', updateError)
      return NextResponse.json({ error: 'فشل في تحديث السؤال' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث السؤال بنجاح',
      faq: updatedFaq
    })
  } catch (error) {
    console.error('Service FAQ PUT error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/service-faq/[id] - Delete service FAQ (seller or admin)
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

    // Check if FAQ exists and user has permission
    const { data: faq, error: fetchError } = await supabase
      .from('service_faq')
      .select(`
        id,
        service_id,
        services!inner(seller_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !faq) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && faq.services.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا السؤال' }, { status: 403 })
    }

    // Delete FAQ
    const { error: deleteError } = await supabase
      .from('service_faq')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting FAQ:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف السؤال' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف السؤال بنجاح'
    })
  } catch (error) {
    console.error('Service FAQ DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
