import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { createPayPalOrder } from "@/lib/paypalClient"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    }

    const body = await request.json()
    const { service_id, package_id, product_id } = body as {
      service_id?: string
      package_id?: string
      product_id?: string
    }

    if (!service_id && !product_id) {
      return NextResponse.json(
        { error: "يجب تحديد خدمة أو منتج للدفع عبر PayPal" },
        { status: 400 }
      )
    }

    let sellerId: string | null = null
    let amount = 0
    let description = "دفع طلب عبر PayPal"

    if (service_id) {
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select("id, seller_id, title")
        .eq("id", service_id)
        .single()

      if (serviceError || !service) {
        return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 })
      }

      if (!package_id) {
        return NextResponse.json(
          { error: "معرّف الباقة مطلوب للدفع عبر PayPal" },
          { status: 400 }
        )
      }

      const { data: pkg, error: pkgError } = await supabase
        .from("service_packages")
        .select("id, price, name")
        .eq("id", package_id)
        .eq("service_id", service_id)
        .single()

      if (pkgError || !pkg) {
        return NextResponse.json({ error: "الباقة غير موجودة لهذه الخدمة" }, { status: 404 })
      }

      sellerId = service.seller_id
      amount = Number(pkg.price)
      description = `دفع خدمة: ${service.title} - باقة: ${pkg.name}`
    } else if (product_id) {
      const { data: product, error: productError } = await supabase
        .from("digital_products")
        .select("id, seller_id, title, price")
        .eq("id", product_id)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: "المنتج الرقمي غير موجود" }, { status: 404 })
      }

      sellerId = product.seller_id
      amount = Number(product.price)
      description = `دفع منتج رقمي: ${product.title}`
    }

    if (!sellerId || amount <= 0) {
      return NextResponse.json(
        { error: "تعذّر تحديد البائع أو المبلغ للدفع عبر PayPal" },
        { status: 400 }
      )
    }

    // Create internal order row first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.userId,
        seller_id: sellerId,
        service_id: service_id || null,
        product_id: product_id || null,
        package_id: package_id || null,
        amount,
        status: "pending",
        payment_method: "paypal",
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating internal PayPal order:", orderError)
      return NextResponse.json(
        { error: "فشل في إنشاء الطلب الداخلي للدفع عبر PayPal" },
        { status: 500 }
      )
    }

    // PayPal currently expects major currencies; for sandbox we can still use DZD-like amounts
    const paypalOrder = await createPayPalOrder({
      amount,
      currency: "USD",
      customId: String(order.id),
      description,
    })

    const paypalOrderId = paypalOrder.id as string
    const paypalStatus = paypalOrder.status as string | undefined

    const approvalUrl =
      (paypalOrder.links || []).find((l: any) => l.rel === "approve")?.href || null

    await supabase
      .from("orders")
      .update({
        paypal_order_id: paypalOrderId,
        paypal_status: paypalStatus || "CREATED",
      })
      .eq("id", order.id)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paypalOrderId,
      approvalUrl,
    })
  } catch (error) {
    console.error("PayPal create-order error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء طلب PayPal" }, { status: 500 })
  }
}

