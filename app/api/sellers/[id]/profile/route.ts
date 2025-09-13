import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// GET /api/sellers/[id]/profile - Get seller profile with services (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'معرف البائع مطلوب' }, { status: 400 })
    }

    // Get seller details
    const { data: seller, error: sellerError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        created_at,
        profiles!inner(
          display_name,
          bio,
          avatar_url,
          location,
          phone,
          is_verified,
          rating,
          completed_orders,
          member_since,
          response_time,
          support_rate,
          languages
        )
      `)
      .eq('id', id)
      .eq('role', 'seller')
      .single()

    if (sellerError || !seller) {
      return NextResponse.json({ error: 'البائع غير موجود' }, { status: 404 })
    }

    // Get seller's services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        category,
        tags,
        rating,
        total_orders,
        created_at,
        service_images(image_url, is_primary),
        service_packages(name, price, delivery_time)
      `)
      .eq('seller_id', id)
      .order('created_at', { ascending: false })

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      // Continue even if services fail
    }

    // Calculate overall stats
    const servicesList = services || []
    const totalServices = servicesList.length
    const totalOrders = servicesList.reduce((sum, service) => sum + (service.total_orders || 0), 0)
    
    // Calculate average rating across all services
    const servicesWithRatings = servicesList.filter(s => s.rating > 0)
    const averageRating = servicesWithRatings.length > 0
      ? servicesWithRatings.reduce((sum, service) => sum + service.rating, 0) / servicesWithRatings.length
      : 0

    // Get total reviews count
    const { data: reviews, error: reviewsError } = await supabase
      .from('service_reviews')
      .select('id')
      .in('service_id', servicesList.map(s => s.id))

    const totalReviews = reviews?.length || 0

    // Format services with primary images
    const formattedServices = servicesList.map(service => ({
      ...service,
      primary_image: service.service_images?.find((img: any) => img.is_primary)?.image_url || 
                    service.service_images?.[0]?.image_url || null,
      min_price: service.service_packages?.length > 0 
        ? Math.min(...service.service_packages.map((p: any) => p.price))
        : 0
    }))

    const sellerProfile = {
      ...seller,
      profile: seller.profiles[0], // profiles is an array due to join
      services: formattedServices,
      stats: {
        total_services: totalServices,
        total_orders: totalOrders,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
        response_time: seller.profiles[0]?.response_time || 'غير محدد',
        support_rate: seller.profiles[0]?.support_rate || 'غير محدد'
      }
    }

    return NextResponse.json({ seller: sellerProfile })
  } catch (error) {
    console.error('Seller profile GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
