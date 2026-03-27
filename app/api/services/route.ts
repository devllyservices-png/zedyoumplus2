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

// GET /api/services - Get all services (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sellerId = searchParams.get('seller_id')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit
    const isPriceSort = sort === "price-low" || sort === "price-high"

    // Subscription gating: only show services for sellers with an active subscription.
    const now = new Date()
    let activeSellerIds: string[] = []

    if (sellerId) {
      const { data: sellerActiveSub, error: sellerActiveErr } = await supabase
        .from("seller_subscriptions")
        .select("seller_id")
        .eq("seller_id", sellerId)
        .gt("ends_at", now.toISOString())
        .limit(1)

      if (sellerActiveErr) {
        console.error("Active seller check failed:", sellerActiveErr)
      }

      activeSellerIds = (sellerActiveSub || []).map((r: any) => r.seller_id)
    } else {
      const { data: activeSellerPeriods, error: activeSellerErr } = await supabase
        .from("seller_subscriptions")
        .select("seller_id")
        .gt("ends_at", now.toISOString())

      if (activeSellerErr) {
        console.error("Active seller fetch failed:", activeSellerErr)
      }

      activeSellerIds = Array.from(
        new Set((activeSellerPeriods || []).map((r: any) => r.seller_id))
      )
    }

    if (!activeSellerIds.length) {
      return NextResponse.json({
        services: [],
        pagination: { page, limit, total: 0, pages: 0 },
      })
    }

    let query = supabase
      .from('services')
      .select(`
        *,
        service_images(image_url, is_primary),
        service_packages(name, price, delivery_time),
        service_reviews(rating, comment, created_at)
      `)

    if (!isPriceSort) {
      query = query.range(offset, offset + limit - 1)
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'price-low':
        // Handled after fetching services (min package price sort).
        break
      case 'price-high':
        // Handled after fetching services (min package price sort).
        break
      case 'orders':
        query = query.order('total_orders', { ascending: false })
        break
      default: // 'newest'
        query = query.order('created_at', { ascending: false })
    }

    if (sellerId) {
      if (!activeSellerIds.includes(sellerId)) {
        return NextResponse.json({
          services: [],
          pagination: { page, limit, total: 0, pages: 0 },
        })
      }
      query = query.eq('seller_id', sellerId)
    } else {
      query = query.in("seller_id", activeSellerIds)
    }

    const { data: servicesRows, error, count } = await query

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'فشل في جلب الخدمات' }, { status: 500 })
    }

    const getMinPackagePrice = (service: any) => {
      const packages: any[] = service?.service_packages || []
      const prices = packages
        .map((p) => Number(p?.price))
        .filter((n) => Number.isFinite(n) && n > 0)
      return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY
    }

    const allServices = servicesRows || []

    let servicesPage: any[] = allServices
    let total = typeof count === "number" ? count : allServices.length

    if (isPriceSort) {
      const sorted = [...allServices].sort((a, b) => {
        const ap = getMinPackagePrice(a)
        const bp = getMinPackagePrice(b)
        return sort === "price-low" ? ap - bp : bp - ap
      })

      total = sorted.length
      servicesPage = sorted.slice(offset, offset + limit)
    }

    // Calculate average ratings and review counts
    const servicesWithStats = await Promise.all((servicesPage || []).map(async (service) => {
      const reviews = service.service_reviews || []
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0

      // Fetch seller profile separately
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

      return {
        ...service,
        average_rating: Math.round(avgRating * 10) / 10,
        reviews_count: reviews.length,
        primary_image: service.service_images?.find((img: any) => img.is_primary)?.image_url || 
                      service.service_images?.[0]?.image_url || null,
        seller_profile: sellerProfile
      }
    }) || [])

    return NextResponse.json({
      services: servicesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Services GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// POST /api/services - Create new service (seller only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بإنشاء الخدمات' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Service creation request body:', body)
    const { title, description, category, tags, packages, faq, images } = body

    // Validate required fields
    if (!title || !packages || !Array.isArray(packages) || packages.length === 0) {
      console.log('Validation failed:', { title, packages })
      return NextResponse.json({ 
        error: 'العنوان والحزم مطلوبة' 
      }, { status: 400 })
    }

    // Create service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        seller_id: user.userId,
        title,
        description,
        category,
        tags: tags || []
      })
      .select()
      .single()

    if (serviceError) {
      console.error('Error creating service:', serviceError)
      return NextResponse.json({ error: 'فشل في إنشاء الخدمة' }, { status: 500 })
    }

    // Create packages
    if (packages && packages.length > 0) {
      const packageData = packages.map((pkg: any) => ({
        service_id: service.id,
        name: pkg.name,
        price: pkg.price,
        delivery_time: pkg.delivery_time,
        revisions: pkg.revisions,
        features: pkg.features || []
      }))

      const { error: packagesError } = await supabase
        .from('service_packages')
        .insert(packageData)

      if (packagesError) {
        console.error('Error creating packages:', packagesError)
        // Continue even if packages fail
      }
    }

    // Create FAQ
    if (faq && faq.length > 0) {
      const faqData = faq.map((item: any) => ({
        service_id: service.id,
        question: item.question,
        answer: item.answer
      }))

      const { error: faqError } = await supabase
        .from('service_faq')
        .insert(faqData)

      if (faqError) {
        console.error('Error creating FAQ:', faqError)
        // Continue even if FAQ fails
      }
    }

    // Create images
    if (images && images.length > 0) {
      const imageData = images.map((img: any, index: number) => ({
        service_id: service.id,
        image_url: img.url,
        is_primary: index === 0 // First image is primary
      }))

      const { error: imagesError } = await supabase
        .from('service_images')
        .insert(imageData)

      if (imagesError) {
        console.error('Error creating images:', imagesError)
        // Continue even if images fail
      }
    }

    console.log('Service created successfully:', service)
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الخدمة بنجاح',
      service
    })
  } catch (error) {
    console.error('Services POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
