import { NextRequest, NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypalClient"

export async function POST(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin

    const paypalOrder = await createPayPalOrder({
      amount: 0.01,
      currency: "EUR",
      customId: `public-test-${Date.now()}`,
      description: "Public PayPal test (0.01 EUR)",
      returnUrl: `${origin}/paypal-test/success`,
      cancelUrl: `${origin}/paypal-test?status=cancelled`,
    })

    const approvalUrl =
      (paypalOrder.links || []).find((l: any) => l.rel === "approve")?.href || null

    if (!approvalUrl) {
      return NextResponse.json(
        { error: "Failed to get PayPal approval URL." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paypalOrderId: paypalOrder.id,
      approvalUrl,
    })
  } catch (error) {
    console.error("PayPal public test create error:", error)
    return NextResponse.json(
      { error: "Could not create PayPal test order. Check credentials and mode." },
      { status: 500 }
    )
  }
}

