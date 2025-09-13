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

// POST /api/services/[id]/packages - Add package to service (seller only)
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
      return NextResponse.json({ error: 'غير مصرح بإضافة الحزم' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, price, delivery_time, revisions, features } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'اسم الحزمة والسعر مطلوبان' }, { status: 400 })
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
      return NextResponse.json({ error: 'غير مصرح بإضافة حزم لهذه الخدمة' }, { status: 403 })
    }

    // Add package
    const { data: package_, error: packageError } = await supabase
      .from('service_packages')
      .insert({
        service_id: id,
        name,
        price,
        delivery_time,
        revisions,
        features: features || []
      })
      .select()
      .single()

    if (packageError) {
      console.error('Error adding package:', packageError)
      return NextResponse.json({ error: 'فشل في إضافة الحزمة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الحزمة بنجاح',
      package: package_
    })
  } catch (error) {
    console.error('Service package POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
