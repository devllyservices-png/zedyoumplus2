import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import { put } from "@vercel/blob"
import { chargilyClient } from "@/lib/chargilyClient"
import { createPayPalOrder } from "@/lib/paypalClient"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId as string, email: decoded.email as string, role: decoded.role as string }
  } catch {
    return null
  }
}

async function convertImageToPreferredFormat(
  input: Buffer,
  contentType: string
): Promise<{ data: Buffer; contentType: string; extension: string }> {
  // Only optimize images; for PDFs/other types, keep original content.
  if (!contentType.startsWith("image/")) {
    return { data: input, contentType, extension: contentType.split("/")[1] || "bin" }
  }

  try {
    // Sharp is optional: if not available, just return original file buffer.
    const sharp = require("sharp")
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
  } catch (sharpError: any) {
    console.warn("Sharp not available, uploading original file:", sharpError?.message)
    const extension = contentType.split("/")[1] || "bin"
    return { data: input, contentType, extension }
  }
}

async function getSubscriptionAmountDzdFromEur(priceEur: number) {
  try {
    const { data: dzdCurrency } = await supabase
      .from("currencies")
      .select("rate_to_eur")
      .eq("code", "DZD")
      .single()

    const dzdRateToEur = Number(dzdCurrency?.rate_to_eur) || 150 // 1 EUR = 150 DZD

    const amountDzd = priceEur * dzdRateToEur
    return Math.round(amountDzd * 100) / 100
  } catch (e) {
    // Fallback if currencies table isn't configured yet.
    const dzdRateToEur = 150
    const amountDzd = priceEur * dzdRateToEur
    return Math.round(amountDzd * 100) / 100
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 403 })
    }
    const sellerId = user.role === "admin" ? null : user.userId
    if (!sellerId) {
      return NextResponse.json({ error: "لا يمكن إنشاء اشتراك نيابة عن بائع عبر هذه الواجهة" }, { status: 403 })
    }

    const formData = await request.formData()
    const paymentMethod = String(formData.get("payment_method") || "").trim()
    if (!paymentMethod) {
      return NextResponse.json({ error: "طريقة الدفع مطلوبة" }, { status: 400 })
    }

    const validMethods = ["bank_transfer", "card_payment", "cash", "paypal"]
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "طريقة دفع غير صحيحة" }, { status: 400 })
    }

    // Determine plan strictly from admin-defined active plans.
    const requestedPlanId = (formData.get("plan_id") as string | null) || null
    let plan: any = null
    if (requestedPlanId) {
      const { data: byId } = await supabase
        .from("seller_subscription_plans")
        .select("id, name, description, price_eur, duration_months, is_active, is_default, paypal_plan_id")
        .eq("id", requestedPlanId)
        .eq("is_active", true)
        .single()
      plan = byId
    }
    if (!plan) {
      const { data: plans } = await supabase
        .from("seller_subscription_plans")
        .select("id, name, description, price_eur, duration_months, is_active, is_default, paypal_plan_id")
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
      if (plans && plans.length > 0) {
        plan = plans[0]
      }
    }

    if (!plan) {
      return NextResponse.json(
        { error: "لا توجد خطط اشتراك مفعّلة من الإدارة حالياً" },
        { status: 400 }
      )
    }

    const planPriceEur = Number(plan.price_eur)
    const durationMonths = Number(plan.duration_months)
    const amountDzd = await getSubscriptionAmountDzdFromEur(planPriceEur)

    // Create invoice row first (so provider metadata can reference it).
    const { data: invoice, error: invoiceError } = await supabase
      .from("seller_subscription_invoices")
      .insert({
        seller_id: sellerId,
        amount_dzd: amountDzd,
        duration_months: durationMonths,
        plan_id: plan?.id || null,
        status: "pending",
        payment_method: paymentMethod,
        phone: (formData.get("phone") as string) || null,
        wilaya: (formData.get("wilaya") as string) || null,
        baladiya: (formData.get("baladiya") as string) || null,
        instructions: (formData.get("instructions") as string) || null,
      })
      .select()
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "فشل في إنشاء فاتورة الاشتراك" }, { status: 500 })
    }

    const origin = new URL(request.url).origin

    if (paymentMethod === "bank_transfer") {
      const paymentProof = formData.get("payment_proof")
      if (!paymentProof || !(paymentProof instanceof File)) {
        return NextResponse.json({ error: "إيصال الدفع مطلوب لتحويل بنكي" }, { status: 400 })
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN
      if (!token) {
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
      }

      const arrayBuffer = await paymentProof.arrayBuffer()
      const inputBuffer = Buffer.from(arrayBuffer)

      const { data: optimizedBuffer, contentType: finalMimeType, extension } =
        await convertImageToPreferredFormat(inputBuffer, paymentProof.type || "application/pdf")

      const timestamp = Date.now()
      const fileName = `subscription-invoices/${invoice.id}-${timestamp}.${extension}`

      const { url } = await put(fileName, optimizedBuffer, {
        access: "public",
        contentType: finalMimeType,
        token,
      })

      const { error: updateErr } = await supabase
        .from("seller_subscription_invoices")
        .update({
          payment_proof_url: url,
        })
        .eq("id", invoice.id)

      if (updateErr) {
        console.error("Failed to update invoice with proof url:", updateErr)
      }

      return NextResponse.json({
        success: true,
        invoice,
        message: "تم إرسال طلب الاشتراك للإدارة (بانتظار الموافقة).",
        redirectUrl: `/dashboard/profile?subscriptionTab=invoices`,
      })
    }

    if (paymentMethod === "cash") {
      return NextResponse.json({
        success: true,
        invoice,
        message: "تم إرسال طلب الاشتراك للإدارة (الدفع نقداً/عند التسليم - بانـتظار الموافقة).",
        redirectUrl: `/dashboard/profile?subscriptionTab=invoices`,
      })
    }

    if (paymentMethod === "card_payment") {
      if (!chargilyClient) {
        return NextResponse.json(
          { error: "نظام الدفع بالبطاقة غير مفعّل حالياً. اختر طريقة أخرى." },
          { status: 500 }
        )
      }

      const successUrl = `${origin}/dashboard/profile?subscriptionPayment=success&invoiceId=${invoice.id}`
      const failureUrl = `${origin}/dashboard/profile?subscriptionPayment=failure&invoiceId=${invoice.id}`

      try {
        const checkout = await chargilyClient.createCheckout({
          amount: Number(amountDzd),
          currency: "dzd",
          success_url: successUrl,
          failure_url: failureUrl,
          locale: "ar",
          metadata: {
            subscription_invoice_id: invoice.id,
            seller_id: sellerId,
          },
        } as any)

        const checkoutUrl = (checkout as any)?.checkout_url || (checkout as any)?.payment_url
        const checkoutId = (checkout as any)?.id || (checkout as any)?.reference

        const { error: updateErr } = await supabase
          .from("seller_subscription_invoices")
          .update({
            chargily_checkout_id: checkoutId || null,
            chargily_checkout_url: checkoutUrl || null,
            chargily_status: "pending",
          })
          .eq("id", invoice.id)

        if (updateErr) {
          console.error("Failed to update invoice with Chargily checkout:", updateErr)
        }

        return NextResponse.json({
          success: true,
          invoice,
          chargilyCheckoutUrl: checkoutUrl,
        })
      } catch (e: any) {
        console.error("Chargily checkout error:", e)
        return NextResponse.json({ error: "حدث خطأ أثناء إنشاء دفع البطاقة" }, { status: 500 })
      }
    }

    if (paymentMethod === "paypal") {
      const returnUrl = `${origin}/payment/paypal/subscriptions/return`
      const cancelUrl = `${origin}/payment/paypal/subscriptions/cancel`

      const approvalData = await createPayPalOrder({
        amount: Number(planPriceEur),
        currency: "EUR",
        customId: String(invoice.id),
        description: `Seller subscription (${durationMonths} month${durationMonths > 1 ? "s" : ""})`,
        returnUrl,
        cancelUrl,
      })

      const approvalUrl =
        (approvalData as any)?.links?.find((l: any) => l.rel === "approve")?.href || null
      const paypalOrderId = (approvalData as any)?.id as string | undefined

      const { error: updateErr } = await supabase
        .from("seller_subscription_invoices")
        .update({
          paypal_order_id: paypalOrderId || null,
          paypal_status: approvalData?.status || "CREATED",
        })
        .eq("id", invoice.id)

      if (updateErr) {
        console.error("Failed to update invoice with PayPal order:", updateErr)
      }

      if (!approvalUrl) {
        return NextResponse.json({ error: "Failed to create PayPal approval URL" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        invoice,
        approvalUrl,
      })
    }

    return NextResponse.json({ error: "طريقة دفع غير مدعومة" }, { status: 400 })
  } catch (error) {
    console.error("Subscriptions checkout POST error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

