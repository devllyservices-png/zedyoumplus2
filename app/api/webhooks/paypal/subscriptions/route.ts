import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// NOTE: Proper PayPal webhook signature verification can be added later.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const eventType = (body.event_type || body.event || "").toString()
    const resource = body.resource || {}
    const subscriptionId =
      resource.id ||
      resource.subscription_id ||
      (resource.billing_agreement_id as string | undefined) ||
      null

    if (!subscriptionId) {
      console.warn("PayPal subscriptions webhook missing subscription id")
      return NextResponse.json({ error: "Missing subscription id" }, { status: 400 })
    }

    const isPaymentCompleted =
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "PAYMENT.SALE.COMPLETED"

    if (!isPaymentCompleted) {
      return NextResponse.json({ success: true, ignored: true })
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("seller_subscription_invoices")
      .select("id, status")
      .eq("paypal_subscription_id", subscriptionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (invoiceError || !invoice) {
      console.warn(
        "PayPal subscriptions webhook: no matching invoice found for subscription",
        subscriptionId,
        invoiceError
      )
      return NextResponse.json({ success: true, invoiceFound: false })
    }

    const alreadyPaidOrApproved =
      invoice.status === "approved" || invoice.status === "paid"

    if (!alreadyPaidOrApproved) {
      const { error: updateErr } = await supabase
        .from("seller_subscription_invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paypal_status: "WEBHOOK_COMPLETED",
        })
        .eq("id", invoice.id)

      if (updateErr) {
        console.error(
          "PayPal subscriptions webhook failed updating invoice:",
          updateErr
        )
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
      }
    }

    const { error: rpcError } = await supabase.rpc(
      "approve_subscription_invoice",
      {
        p_invoice_id: invoice.id,
      }
    )

    if (rpcError) {
      console.error(
        "approve_subscription_invoice rpc error (from PayPal webhook):",
        rpcError
      )
      return NextResponse.json({ error: "Failed to extend subscription period" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PayPal subscriptions webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

