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

// DELETE /api/service-reviews/[id] - Delete service review (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بحذف التقييمات' }, { status: 403 })
    }

    const { id } = await params

    // Check if review exists
    const { data: review, error: fetchError } = await supabase
      .from('service_reviews')
      .select('id, service_id')
      .eq('id', id)
      .single()

    if (fetchError || !review) {
      return NextResponse.json({ error: 'التقييم غير موجود' }, { status: 404 })
    }

    // Delete review
    const { error: deleteError } = await supabase
      .from('service_reviews')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting review:', deleteError)
      return NextResponse.json({ error: 'فشل في حذف التقييم' }, { status: 500 })
    }

    // Update service rating
    const { data: remainingReviews } = await supabase
      .from('service_reviews')
      .select('rating')
      .eq('service_id', review.service_id)

    if (remainingReviews && remainingReviews.length > 0) {
      const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      
      await supabase
        .from('services')
        .update({ 
          rating: Math.round(avgRating * 10) / 10,
          total_orders: remainingReviews.length
        })
        .eq('id', review.service_id)
    } else {
      // No reviews left, reset rating
      await supabase
        .from('services')
        .update({ 
          rating: 0,
          total_orders: 0
        })
        .eq('id', review.service_id)
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    })
  } catch (error) {
    console.error('Service review DELETE error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
