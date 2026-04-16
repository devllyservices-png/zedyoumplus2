import { getPayPalApiBase } from "@/lib/paypalClient"

const PAYPAL_API_BASE = getPayPalApiBase()

type SellerSubscriptionPlanRow = {
  id: string
  name: string
  description?: string | null
  price_eur: number
  duration_months: number
  paypal_product_id?: string | null
  paypal_plan_id?: string | null
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim()
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error("PayPal environment variables are not configured.")
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const form = new URLSearchParams({
    grant_type: "client_credentials",
  })

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to fetch PayPal access token (subscriptions):", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal OAuth failed (${res.status}): ${preview}`)
  }

  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function createPayPalProductForPlan(plan: SellerSubscriptionPlanRow) {
  const accessToken = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: plan.name || "Seller Subscription",
      description: plan.description || "ZedyoumPlus seller subscription",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to create PayPal product:", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal create product failed (${res.status}): ${preview}`)
  }

  const data = (await res.json()) as { id: string }
  return { productId: data.id }
}

export async function createOrUpdatePayPalBillingPlan(plan: SellerSubscriptionPlanRow & { paypal_product_id: string }) {
  const accessToken = await getAccessToken()

  const intervalUnit = "MONTH"
  const intervalCount = Math.max(1, Math.floor(plan.duration_months || 1))

  const body = {
    product_id: plan.paypal_product_id,
    name: plan.name || "Seller Subscription Plan",
    description: plan.description || "Recurring seller subscription",
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: {
          interval_unit: intervalUnit,
          interval_count: intervalCount,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: {
            value: plan.price_eur.toFixed(2),
            currency_code: "EUR",
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CANCEL",
      payment_failure_threshold: 3,
    },
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to create PayPal billing plan:", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal create billing plan failed (${res.status}): ${preview}`)
  }

  const data = (await res.json()) as { id: string }
  return { planId: data.id }
}

export async function createPayPalSubscription(params: {
  paypal_plan_id: string
  sellerId: string
  planId: string
  returnUrl: string
  cancelUrl: string
}) {
  const accessToken = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: params.paypal_plan_id,
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
      custom_id: `${params.sellerId}:${params.planId}`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to create PayPal subscription:", res.status, text)
    const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text
    throw new Error(`PayPal create subscription failed (${res.status}): ${preview}`)
  }

  const data = (await res.json()) as any
  const approvalUrl =
    (data.links || []).find((l: any) => l.rel === "approve")?.href || null

  return {
    subscriptionId: data.id as string,
    approvalUrl,
    raw: data,
  }
}

