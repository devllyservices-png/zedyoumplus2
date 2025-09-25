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
    if (!user) {
      console.log('No user found in buyer orders API')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('Fetching orders for buyer:', user.userId, 'User object:', user)

    // Fetch buyer's orders with service details only (digital_products not implemented yet)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        created_at,
        payment_method,
        additional_notes,
        service_id,
        package_id,
        services!service_id (
          title,
          seller_id,
          users!seller_id (
            email
          )
        )
      `)
      .eq('buyer_id', user.userId)
      .not('service_id', 'is', null)  // Only get service orders for now
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('Orders query result:', { orders, ordersError })

    if (ordersError) {
      console.error('Error fetching buyer orders:', ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log('Raw orders from database:', orders)
    console.log('Number of orders found:', orders?.length || 0)

    // Get package details for orders that have package_id
    const packageIds = orders?.filter(order => order.package_id).map(order => order.package_id) || []
    let packageDetails = {}
    
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

    // Calculate total money spent
    const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.amount || 0), 0) || 0
    console.log('Total spent calculated:', totalSpent)

    // Format orders for display (service orders only for now)
    const formattedOrders = orders?.map(order => {
      const title = order.services?.title
      const sellerEmail = order.services?.users?.email
      const packageName = order.package_id ? packageDetails[order.package_id] : null

      console.log('Formatting order:', {
        id: order.id,
        title,
        sellerEmail,
        packageId: order.package_id,
        packageName,
        amount: order.amount
      })

      return {
        id: order.id,
        title: title || 'خدمة غير محددة',
        seller: sellerEmail || 'مقدم خدمة غير محدد',
        price: order.amount,
        package: packageName || null,
        status: order.status,
        payment_method: order.payment_method,
        date: new Date(order.created_at).toLocaleDateString('ar-DZ'),
        created_at: order.created_at
      }
    }) || []

    console.log('Formatted orders:', formattedOrders)

    return NextResponse.json({
      orders: formattedOrders,
      totalSpent,
      totalOrders: orders?.length || 0
    })

  } catch (error) {
    console.error('Error in buyer orders API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
