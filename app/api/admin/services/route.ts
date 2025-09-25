import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all services with seller details
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select(`
        id,
        title,
        description,
        created_at,
        seller_id,
        users!seller_id (
          email,
          profiles!user_id (
            display_name
          )
        ),
        service_images!service_id (
          image_url,
          is_primary
        ),
        service_packages!service_id (
          price
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    console.log('Admin services query result:', { services, servicesError })

    if (servicesError) {
      console.error('Error fetching admin services:', servicesError)
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
    }

    console.log('Returning services:', services?.length || 0, 'services found')

    return NextResponse.json({
      services: services || []
    })

  } catch (error) {
    console.error('Error in admin services API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
