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

// GET /api/services/[id]/reviews - Get service reviews (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Get reviews
    const { data: reviews, error, count } = await supabase
      .from('service_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        users!service_reviews_user_id_fkey(display_name, avatar_url)
      `)
      .eq('service_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'فشل في جلب التقييمات' }, { status: 500 })
    }

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Service reviews GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/services/[id]/reviews - Create service review (buyer only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (user.role !== 'buyer') {
      return NextResponse.json({ error: 'يمكن للمشترين فقط إضافة التقييمات' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و 5' }, { status: 400 })
    }

    // Check if service exists
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, seller_id, title')
      .eq('id', id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Check if user is not the seller
    if (service.seller_id === user.userId) {
      return NextResponse.json({ error: 'لا يمكن تقييم خدماتك الخاصة' }, { status: 403 })
    }

    // Check if user already reviewed this service
    const { data: existingReview } = await supabase
      .from('service_reviews')
      .select('id')
      .eq('service_id', id)
      .eq('user_id', user.userId)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'لقد قمت بتقييم هذه الخدمة مسبقاً' }, { status: 400 })
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('service_reviews')
      .insert({
        service_id: id,
        user_id: user.userId,
        rating,
        comment
      })
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        users!service_reviews_user_id_fkey(display_name, avatar_url)
      `)
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json({ error: 'فشل في إضافة التقييم' }, { status: 500 })
    }

    // Update service rating
    const { data: allReviews } = await supabase
      .from('service_reviews')
      .select('rating')
      .eq('service_id', id)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      
      await supabase
        .from('services')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          total_orders: allReviews.length
        })
        .eq('id', id)
    }

    // Trigger notification for new review
    try {
      await NotificationTriggers.onReviewReceived({
        reviewId: review.id,
        reviewerId: user.userId,
        sellerId: service.seller_id,
        rating: rating,
        serviceTitle: service.title
      })
    } catch (notificationError) {
      console.error('Error sending notification for new review:', notificationError)
      // Don't fail the review creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review
    })
  } catch (error) {
    console.error('Service review POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
