import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
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

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        suspended,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching admin users:', usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        avatar_url,
        phone
      `)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Join users with their profiles
    const usersWithProfiles = (users || []).map(user => {
      const profile = profiles?.find(p => p.user_id === user.id)
      return {
        ...user,
        profiles: profile || null
      }
    })

    console.log('Users with profiles:', usersWithProfiles.map(u => ({
      email: u.email,
      hasProfile: !!u.profiles,
      avatar_url: u.profiles?.avatar_url
    })))

    // Calculate total spent/earnings for each user
    const usersWithStats = await Promise.all(
      usersWithProfiles.map(async (user) => {
        if (user.role === 'buyer') {
          // Calculate total spent
          const { data: orders } = await supabase
            .from('orders')
            .select('amount')
            .eq('buyer_id', user.id)
            .eq('status', 'completed')

          const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0
          return { ...user, totalSpent }
        } else if (user.role === 'seller') {
          // Calculate total earnings
          const { data: orders } = await supabase
            .from('orders')
            .select('amount')
            .eq('seller_id', user.id)
            .eq('status', 'completed')

          const totalEarnings = orders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0
          return { ...user, totalEarnings }
        }
        return user
      })
    )

    return NextResponse.json({
      users: usersWithStats
    })

  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
