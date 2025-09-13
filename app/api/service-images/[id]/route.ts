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

// DELETE /api/service-images/[id] - Delete service image (seller or admin)
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

    // Check if image exists and user has permission
    const { data: image, error: fetchError } = await supabase
      .from('service_images')
      .select(`
        id,
        service_id,
        services!inner(seller_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && image.services.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بحذف هذه الصورة' }, { status: 403 })
    }

    // Delete image
    const { error: deleteError } = await supabase
      .from('service_images')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting image:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف الصورة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح'
    })
  } catch (error) {
    console.error('Service image DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
