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

// PUT /api/service-packages/[id] - Update service package (seller or admin)
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
    const { name, price, delivery_time, revisions, features } = body

    // Check if package exists and user has permission
    const { data: package_, error: fetchError } = await supabase
      .from('service_packages')
      .select(`
        id,
        service_id,
        services!inner(seller_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !package_) {
      return NextResponse.json({ error: 'الحزمة غير موجودة' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && package_.services.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بتعديل هذه الحزمة' }, { status: 403 })
    }

    // Update package
    const { data: updatedPackage, error: updateError } = await supabase
      .from('service_packages')
      .update({
        name,
        price,
        delivery_time,
        revisions,
        features: features || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating package:', updateError)
      return NextResponse.json({ error: 'فشل في تحديث الحزمة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الحزمة بنجاح',
      package: updatedPackage
    })
  } catch (error) {
    console.error('Service package PUT error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/service-packages/[id] - Delete service package (seller or admin)
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

    // Check if package exists and user has permission
    const { data: package_, error: fetchError } = await supabase
      .from('service_packages')
      .select(`
        id,
        service_id,
        services!inner(seller_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !package_) {
      return NextResponse.json({ error: 'الحزمة غير موجودة' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && package_.services.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بحذف هذه الحزمة' }, { status: 403 })
    }

    // Delete package
    const { error: deleteError } = await supabase
      .from('service_packages')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting package:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف الحزمة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الحزمة بنجاح'
    })
  } catch (error) {
    console.error('Service package DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
