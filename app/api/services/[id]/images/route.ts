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

// POST /api/services/[id]/images - Add image to service (seller only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بإضافة الصور' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { image_url, is_primary = false } = body

    if (!image_url) {
      return NextResponse.json({ error: 'رابط الصورة مطلوب' }, { status: 400 })
    }

    // Check if service exists and user owns it
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    if (user.role !== 'admin' && service.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بإضافة صور لهذه الخدمة' }, { status: 403 })
    }

    // If this is set as primary, unset other primary images
    if (is_primary) {
      await supabase
        .from('service_images')
        .update({ is_primary: false })
        .eq('service_id', id)
    }

    // Add new image
    const { data: image, error: imageError } = await supabase
      .from('service_images')
      .insert({
        service_id: id,
        image_url,
        is_primary
      })
      .select()
      .single()

    if (imageError) {
      console.error('Error adding image:', imageError)
      return NextResponse.json({ error: 'فشل في إضافة الصورة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الصورة بنجاح',
      image
    })
  } catch (error) {
    console.error('Service image POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
