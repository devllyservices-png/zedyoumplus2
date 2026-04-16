import { NextRequest, NextResponse } from "next/server"
import { createPayPalOrder } from "@/lib/paypalClient"

export async function POST(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin

    const paypalOrder = await createPayPalOrder({
      amount: 1,
      currency: "EUR",
      customId: `sandbox-test-${Date.now()}`,
      description: "Public sandbox PayPal test (1 EUR)",
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
      { error: "Could not create sandbox PayPal order. Check credentials and mode." },
      { status: 500 }
    )
  }
}

