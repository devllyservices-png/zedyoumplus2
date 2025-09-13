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

// GET /api/services/[id] - Get single service (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'معرف الخدمة مطلوب' }, { status: 400 })
    }

    // First try a simple query to get the service
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        service_images(id, image_url, is_primary),
        service_packages(id, name, price, delivery_time, revisions, features),
        service_faq(id, question, answer)
      `)
      .eq('id', id)
      .single()

    if (error || !service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Get reviews separately to avoid join issues
    let serviceWithReviews = { ...service, service_reviews: [] }
    try {
      const { data: reviews, error: reviewsError } = await supabase
        .from('service_reviews')
        .select(`
          id, 
          rating, 
          comment, 
          created_at,
          user_id
        `)
        .eq('service_id', id)
      
      if (!reviewsError && reviews) {
        serviceWithReviews.service_reviews = reviews
      }
    } catch (reviewsErr) {
      console.log('⚠️ Could not fetch reviews:', reviewsErr)
      // Continue without reviews
    }

    // Calculate average rating and review count
    const reviews = serviceWithReviews.service_reviews || []
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0

    // Fetch seller profile
    let sellerProfile = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, is_verified, rating, completed_orders, response_time')
        .eq('user_id', service.seller_id)
        .single()
      sellerProfile = profile
    } catch (err) {
      console.log('Could not fetch seller profile:', err)
    }

    const serviceWithStats = {
      ...serviceWithReviews,
      average_rating: Math.round(avgRating * 10) / 10,
      reviews_count: reviews.length,
      primary_image: service.service_images?.find((img: any) => img.is_primary)?.image_url || 
                    service.service_images?.[0]?.image_url || null,
      seller_profile: sellerProfile
    }

    return NextResponse.json({ service: serviceWithStats })
  } catch (error) {
    console.error('Service GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/services/[id] - Update service (seller or admin)
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
    const { title, description, category, tags } = body

    // Check if service exists and user has permission
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingService) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && existingService.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بتعديل هذه الخدمة' }, { status: 403 })
    }

    // Update service
    const { data: service, error: updateError } = await supabase
      .from('services')
      .update({
        title,
        description,
        category,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating service:', updateError)
      return NextResponse.json({ error: 'فشل في تحديث الخدمة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الخدمة بنجاح',
      service
    })
  } catch (error) {
    console.error('Service PUT error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE /api/services/[id] - Delete service (seller or admin)
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

    // Check if service exists and user has permission
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingService) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    // Check permissions
    if (user.role !== 'admin' && existingService.seller_id !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح بحذف هذه الخدمة' }, { status: 403 })
    }

    // Delete service (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting service:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف الخدمة' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الخدمة بنجاح'
    })
  } catch (error) {
    console.error('Service DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
