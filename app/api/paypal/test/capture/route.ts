import { NextRequest, NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/paypalClient"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { paypal_order_id?: string }
    const paypalOrderId = body?.paypal_order_id

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: "paypal_order_id is required." },
        { status: 400 }
      )
    }

    const captureResult = await capturePayPalOrder(paypalOrderId)
    const status = String(captureResult?.status || "")

    return NextResponse.json({
      success: status === "COMPLETED",
      status,
      captureResult,
    })
  } catch (error) {
    console.error("PayPal public test capture error:", error)
    return NextResponse.json(
      { error: "Could not capture sandbox PayPal order." },
      { status: 500 }
    )
  }
}

