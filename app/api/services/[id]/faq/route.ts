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

// POST /api/services/[id]/faq - Add FAQ to service (seller only)
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
      return NextResponse.json({ error: 'غير مصرح بإضافة الأسئلة الشائعة' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { question, answer } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'السؤال والإجابة مطلوبان' }, { status: 400 })
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
      return NextResponse.json({ error: 'غير مصرح بإضافة أسئلة لهذه الخدمة' }, { status: 403 })
    }

    // Add FAQ
    const { data: faq, error: faqError } = await supabase
      .from('service_faq')
      .insert({
        service_id: id,
        question,
        answer
      })
      .select()
      .single()

    if (faqError) {
      console.error('Error adding FAQ:', faqError)
      return NextResponse.json({ error: 'فشل في إضافة السؤال' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة السؤال بنجاح',
      faq
    })
  } catch (error) {
    console.error('Service FAQ POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
