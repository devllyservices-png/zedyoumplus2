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
    if (!user) {
      console.log('No user found in seller orders API')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== 'seller') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log('Fetching orders for seller:', user.userId)

    // Fetch seller's orders (excluding pending status)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        created_at,
        payment_method,
        additional_notes,
        payment_proof_url,
        service_id,
        package_id,
        buyer_id,
        services!service_id (
          title,
          seller_id
        ),
        users!buyer_id (
          email,
          profiles!user_id (
            display_name
          )
        )
      `)
      .eq('seller_id', user.userId)
      .not('status', 'eq', 'pending')  // Exclude pending orders
      .order('created_at', { ascending: false })
      .limit(20)

    console.log('Seller orders query result:', { orders, ordersError })

    if (ordersError) {
      console.error('Error fetching seller orders:', ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Get package details for orders that have package_id
    const packageIds = orders?.filter(order => order.package_id).map(order => order.package_id) || []
    let packageDetails: { [key: string]: string } = {}

    if (packageIds.length > 0) {
      const { data: packages, error: packagesError } = await supabase
        .from('service_packages')
        .select('id, name')
        .in('id', packageIds)

      if (packagesError) {
        console.error('Error fetching package details:', packagesError)
      } else {
        packageDetails = packages?.reduce((acc, pkg) => {
          acc[pkg.id] = pkg.name
          return acc
        }, {}) || {}
        console.log('Package details:', packageDetails)
      }
    }

    // Calculate stats
    const inProgressOrders = orders?.filter(order => order.status === 'in_progress').length || 0
    const completedOrders = orders?.filter(order => order.status === 'completed').length || 0
    const totalEarnings = orders?.reduce((sum, order) => {
      return order.status === 'completed' ? sum + parseFloat(order.amount || 0) : sum
    }, 0) || 0

    // Format orders for display
    const formattedOrders = orders?.map(order => {
      const title = order.services?.title
      const buyerEmail = order.users?.email
      const buyerName = order.users?.profiles?.display_name
      const packageName = order.package_id ? packageDetails[order.package_id] : null

      return {
        id: order.id,
        title: title || 'خدمة غير محددة',
        buyer: buyerName || buyerEmail || 'مشتري غير محدد',
        buyerEmail: buyerEmail,
        price: order.amount,
        package: packageName || null,
        status: order.status,
        payment_method: order.payment_method,
        additional_notes: order.additional_notes,
        payment_proof_url: order.payment_proof_url,
        date: new Date(order.created_at).toLocaleDateString('ar-DZ'),
        created_at: order.created_at
      }
    }) || []

    console.log('Formatted seller orders:', formattedOrders)

    return NextResponse.json({
      orders: formattedOrders,
      stats: {
        inProgressOrders,
        completedOrders,
        totalEarnings
      }
    })

  } catch (error) {
    console.error('Error in seller orders API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
