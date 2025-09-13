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

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const formData = await request.formData()
    const serviceId = formData.get("service_id") as string
    const packageId = formData.get("package_id") as string
    const sellerId = formData.get("seller_id") as string
    const amount = parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const paymentProof = formData.get("payment_proof") as File | null

    // Validate required fields
    if (!serviceId || !packageId || !sellerId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'جميع الحقول مطلوبة' 
      }, { status: 400 })
    }

    // Get seller ID from service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('seller_id')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.userId,
        seller_id: service.seller_id,
        service_id: serviceId,
        package_id: packageId,
        amount: amount,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'فشل في إنشاء الطلب' }, { status: 500 })
    }

    // Handle payment proof upload if provided
    if (paymentProof && paymentProof.size > 0) {
      try {
        // Upload payment proof to Supabase Storage
        const fileName = `payment-proofs/${order.id}/${paymentProof.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProof)

        if (uploadError) {
          console.error('Error uploading payment proof:', uploadError)
          // Continue without payment proof
        } else {
          // Update order with payment proof URL
          const { data: publicUrl } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName)

          await supabase
            .from('orders')
            .update({ 
              payment_proof_url: publicUrl.publicUrl,
              payment_method: paymentMethod
            })
            .eq('id', order.id)
        }
      } catch (uploadErr) {
        console.error('Error handling payment proof:', uploadErr)
        // Continue without payment proof
      }
    } else {
      // Update order with payment method only
      await supabase
        .from('orders')
        .update({ payment_method: paymentMethod })
        .eq('id', order.id)
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order
    })

  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// GET /api/orders - Get user's orders (buyer or seller)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'buyer' // 'buyer' or 'seller'
    const status = searchParams.get('status') // optional filter
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select(`
        *,
        services!orders_service_id_fkey(
          id,
          title,
          category,
          primary_image:service_images!inner(image_url)
        ),
        service_packages!orders_package_id_fkey(
          id,
          name,
          price,
          delivery_time
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          profiles!inner(display_name, avatar_url)
        ),
        seller:users!orders_seller_id_fkey(
          id,
          profiles!inner(display_name, avatar_url, is_verified)
        )
      `)
      .range(offset, offset + limit - 1)

    // Apply filters based on user type
    if (type === 'buyer') {
      query = query.eq('buyer_id', user.userId)
    } else if (type === 'seller') {
      query = query.eq('seller_id', user.userId)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'فشل في جلب الطلبات' }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

