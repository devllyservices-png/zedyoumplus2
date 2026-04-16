import { NextRequest, NextResponse } from "next/server"
import {
  createPayPalOrder,
  getPayPalApiBase,
  getPayPalMode,
} from "@/lib/paypalClient"

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
        {
          error: "Failed to get PayPal approval URL.",
          details: "Order was created but no approve link was returned.",
          paypalOrderId: paypalOrder.id,
          apiBase: getPayPalApiBase(),
          mode: getPayPalMode(),
        },
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
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        error: "Could not create PayPal test order.",
        details,
        apiBase: getPayPalApiBase(),
        mode: getPayPalMode(),
      },
      { status: 500 }
    )
  }
}

