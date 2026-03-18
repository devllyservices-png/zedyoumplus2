
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { put } from "@vercel/blob"
import sharp from "sharp"
import { NotificationTriggers } from "@/lib/notifications"
import { chargilyClient } from "@/lib/chargilyClient"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

// Image optimization function with fallback
async function convertImageToPreferredFormat(input: Buffer, contentType: string): Promise<{ data: Buffer; contentType: string; extension: string }> {
  // Only optimize image files, not PDFs
  if (!contentType.startsWith('image/')) {
    return { data: input, contentType, extension: contentType.split('/')[1] || 'bin' }
  }

  // Try to use Sharp for optimization, fallback to original if not available
  try {
    const sharp = require('sharp')
    const image = sharp(input, { failOn: "none" })
    const isLarge = input.byteLength > 1_500_000
    const quality = isLarge ? 65 : 75

    try {
      const avifBuffer = await image.avif({ quality }).toBuffer()
      return { data: avifBuffer, contentType: "image/avif", extension: "avif" }
    } catch {
      const webpBuffer = await sharp(input, { failOn: "none" }).webp({ quality }).toBuffer()
      return { data: webpBuffer, contentType: "image/webp", extension: "webp" }
    }
  } catch (sharpError) {
    const err = sharpError as Error
    console.warn('Sharp not available, using original file:', err.message)
    // Fallback to original file if Sharp is not available
    const extension = contentType.split('/')[1] || 'bin'
    return { data: input, contentType, extension }
  }
}

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

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const formData = await request.formData()
    const serviceId = formData.get("service_id") as string
    const productId = formData.get("product_id") as string
    const packageId = formData.get("package_id") as string
    const sellerId = formData.get("seller_id") as string
    const amount = parseFloat(formData.get("amount") as string)
    const paymentMethod = formData.get("payment_method") as string
    const paymentProof = formData.get("payment_proof") as File | null
    const additionalNotes = formData.get("additional_notes") as string

    // Validate required fields - either service or product must be provided
    if ((!serviceId && !productId) || !amount) {
      return NextResponse.json({ 
        error: 'معرف الخدمة أو المنتج والمبلغ مطلوبان' 
      }, { status: 400 })
    }

    // If service order, package is required
    if (serviceId && !packageId) {
      return NextResponse.json({ 
        error: 'معرف الباقة مطلوب للخدمات' 
      }, { status: 400 })
    }

    // Validate payment method
    if (!paymentMethod) {
      return NextResponse.json({ 
        error: 'طريقة الدفع مطلوبة' 
      }, { status: 400 })
    }

    const isChargilyPayment = paymentMethod === "chargily_card" || paymentMethod === "card_payment"

    // Validate payment proof for methods that require it (bank transfer / manual card proof)
    if (!isChargilyPayment && (paymentMethod === "bank_transfer" || paymentMethod === "card_payment") && !paymentProof) {
      return NextResponse.json({ 
        error: 'إيصال الدفع مطلوب لهذه الطريقة' 
      }, { status: 400 })
    }

    let finalSellerId = sellerId
    let finalAmount = amount

    // Handle service orders
    if (serviceId) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id, seller_id, title')
        .eq('id', serviceId)
        .single()

      if (serviceError || !service) {
        console.error('Service not found:', serviceError)
        return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
      }

      // Verify the package exists and belongs to the service
      const { data: packageData, error: packageError } = await supabase
        .from('service_packages')
        .select('id, name, price, service_id')
        .eq('id', packageId)
        .eq('service_id', serviceId)
        .single()

      if (packageError || !packageData) {
        console.error('Package not found or does not belong to service:', packageError)
        return NextResponse.json({ error: 'الباقة غير موجودة أو لا تنتمي لهذه الخدمة' }, { status: 404 })
      }

      finalSellerId = service.seller_id
      finalAmount = packageData.price
    }

    // Handle product orders
    if (productId) {
      const { data: product, error: productError } = await supabase
        .from('digital_products')
        .select('id, seller_id, title, price')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        console.error('Product not found:', productError)
        return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 })
      }

      finalSellerId = product.seller_id
      finalAmount = product.price
    }

    // Create order with all details
    const orderData = {
      buyer_id: user.userId,
      seller_id: finalSellerId,
      service_id: serviceId || null,
      product_id: productId || null,
      package_id: packageId || null,
      amount: finalAmount,
      status: 'pending',
      payment_method: paymentMethod,
      additional_notes: additionalNotes || null
    }

    console.log('Creating order with data:', orderData)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      console.error('Order data that failed:', orderData)
      
      // Provide more specific error messages
      if (orderError.code === '23505') {
        return NextResponse.json({ error: 'الطلب موجود مسبقاً' }, { status: 409 })
      } else if (orderError.code === '23503') {
        return NextResponse.json({ error: 'الخدمة أو الباقة غير موجودة' }, { status: 400 })
      } else if (orderError.code === '23514') {
        return NextResponse.json({ error: 'قيمة غير صحيحة في أحد الحقول' }, { status: 400 })
      } else {
        return NextResponse.json({ 
          error: 'فشل في إنشاء الطلب: ' + (orderError.message || 'خطأ غير معروف'),
          details: orderError
        }, { status: 500 })
      }
    }

    // Log order creation on server
    console.log('=== NEW ORDER CREATED ===')
    console.log('Order ID:', order.id)
    console.log('Buyer ID:', order.buyer_id)
    console.log('Seller ID:', order.seller_id)
    console.log('Service ID:', order.service_id)
    console.log('Product ID:', order.product_id)
    console.log('Package ID:', order.package_id)
    console.log('Amount:', order.amount)
    console.log('Payment Method:', paymentMethod)
    console.log('Status:', order.status)
    console.log('Additional Notes:', additionalNotes)
    console.log('Created At:', order.created_at)
    console.log('========================')

    // If using Chargily for card payment, create a checkout and return its URL
    if (isChargilyPayment) {
      if (!chargilyClient) {
        console.error("Chargily client is not configured. Missing CHARGILY_PRIVATE_KEY.")
        return NextResponse.json(
          { error: "نظام الدفع بالبطاقة غير مفعّل حالياً. يرجى اختيار طريقة دفع أخرى." },
          { status: 500 }
        )
      }

      const origin = new URL(request.url).origin
      const successUrl = `${origin}/payment/chargily/success?order_id=${order.id}`
      const failureUrl = `${origin}/payment/chargily/failure?order_id=${order.id}`

      try {
        const checkout = await chargilyClient.createCheckout({
          amount: Number(order.amount),
          currency: "dzd",
          success_url: successUrl,
          failure_url: failureUrl,
          locale: "ar",
          metadata: {
            order_id: order.id,
            buyer_id: order.buyer_id,
            seller_id: order.seller_id,
            service_id: order.service_id,
            product_id: order.product_id,
          },
        } as any)

        const checkoutUrl = (checkout as any)?.checkout_url || (checkout as any)?.payment_url
        const checkoutId = (checkout as any)?.id || (checkout as any)?.reference

        // Store Chargily reference on the order
        const { error: updateOrderError } = await supabase
          .from("orders")
          .update({
            chargily_checkout_id: checkoutId || null,
            chargily_checkout_url: checkoutUrl || null,
            chargily_status: "pending",
          })
          .eq("id", order.id)

        if (updateOrderError) {
          console.error("Error updating order with Chargily checkout info:", updateOrderError)
        }

        return NextResponse.json({
          success: true,
          message: "تم إنشاء الطلب بنجاح. سيتم تحويلك إلى صفحة الدفع.",
          order,
          chargilyCheckoutUrl: checkoutUrl,
        })
      } catch (chargilyError) {
        console.error("Error creating Chargily checkout:", chargilyError)
        return NextResponse.json(
          { error: "حدث خطأ أثناء إنشاء طلب الدفع بالبطاقة. يرجى المحاولة لاحقاً أو اختيار طريقة دفع أخرى." },
          { status: 500 }
        )
      }
    }

    // Trigger notifications for non-Chargily orders immediately (manual payments)
    try {
      // Get service/product title for notification
      let serviceTitle = 'خدمة غير محددة'
      if (serviceId) {
        const { data: service } = await supabase
          .from('services')
          .select('title')
          .eq('id', serviceId)
          .single()
        if (service) serviceTitle = service.title
      } else if (productId) {
        const { data: product } = await supabase
          .from('digital_products')
          .select('title')
          .eq('id', productId)
          .single()
        if (product) serviceTitle = product.title
      }

      await NotificationTriggers.onNewOrder({
        orderId: order.id,
        buyerId: order.buyer_id,
        sellerId: order.seller_id,
        serviceTitle
      })
    } catch (notificationError) {
      console.error('Error sending notifications for new order:', notificationError)
      // Don't fail the order creation if notifications fail
    }

    // Handle payment proof upload if provided (for non-Chargily/manual methods)
    let paymentProofUrl = null
    if (paymentProof && paymentProof.size > 0) {
      try {
        console.log('Processing payment proof upload...')
        console.log('Original file:', {
          name: paymentProof.name,
          size: paymentProof.size,
          type: paymentProof.type
        })

        // Convert File to Buffer
        const arrayBuffer = await paymentProof.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)

        // Use the same optimization logic as upload API
        const { data: optimizedBuffer, contentType: finalMimeType, extension } = await convertImageToPreferredFormat(inputBuffer, paymentProof.type)
        
        // Generate filename with proper extension
        const timestamp = Date.now()
        const fileName = `payment-proofs/${order.id}-${timestamp}.${extension}`
        
        console.log('File processed:', {
          originalSize: inputBuffer.length,
          optimizedSize: optimizedBuffer.length,
          originalType: paymentProof.type,
          finalType: finalMimeType,
          extension
        })

        // Calculate size reduction for images
        if (paymentProof.type.startsWith('image/')) {
          const sizeReduction = ((inputBuffer.length - optimizedBuffer.length) / inputBuffer.length * 100).toFixed(1)
          const sizeReductionKB = ((inputBuffer.length - optimizedBuffer.length) / 1024).toFixed(1)
          console.log(`🖼️ Image optimized: ${(inputBuffer.length / 1024).toFixed(1)}KB → ${(optimizedBuffer.length / 1024).toFixed(1)}KB (${sizeReduction}% reduction, saved ${sizeReductionKB}KB)`)
        } else {
          console.log('📄 PDF file - no optimization needed')
        }

        // Upload to Vercel Blob (same as existing upload system)
        const token = process.env.BLOB_READ_WRITE_TOKEN
        if (!token) {
          console.error('Missing BLOB_READ_WRITE_TOKEN for payment proof upload')
        } else {
          try {
            const { url } = await put(fileName, optimizedBuffer, {
              access: "public",
              contentType: finalMimeType,
              token,
            })

            paymentProofUrl = url

            // Update order with payment proof URL
            const { error: updateError } = await supabase
              .from('orders')
              .update({ payment_proof_url: paymentProofUrl })
              .eq('id', order.id)

            if (updateError) {
              console.error('Error updating order with payment proof URL:', updateError)
            } else {
              console.log('Payment proof uploaded successfully:', {
                url: paymentProofUrl,
                fileName,
                mimeType: finalMimeType,
                size: optimizedBuffer.length
              })
            }
          } catch (uploadError) {
            console.error('Error uploading payment proof to Vercel Blob:', uploadError)
            // Continue without payment proof - don't fail the order
          }
        }
      } catch (uploadErr) {
        console.error('Error handling payment proof upload:', uploadErr)
        // Continue without payment proof - don't fail the order
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order: {
        ...order,
        payment_proof_url: paymentProofUrl
      }
    })

  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// GET /api/orders - Get user's orders (buyer or seller)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'buyer' // 'buyer' or 'seller'
    const status = searchParams.get('status') // optional filter
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select(`
        *,
        services!orders_service_id_fkey(
          id,
          title,
          category,
          primary_image:service_images!inner(image_url)
        ),
        service_packages!orders_package_id_fkey(
          id,
          name,
          price,
          delivery_time
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          profiles!inner(display_name, avatar_url)
        ),
        seller:users!orders_seller_id_fkey(
          id,
          profiles!inner(display_name, avatar_url, is_verified)
        )
      `)
      .range(offset, offset + limit - 1)

    // Apply filters based on user type
    if (type === 'buyer') {
      query = query.eq('buyer_id', user.userId)
    } else if (type === 'seller') {
      query = query.eq('seller_id', user.userId)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'فشل في جلب الطلبات' }, { status: 500 })
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

