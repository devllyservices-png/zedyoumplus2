const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"

const PAYPAL_API_BASE =
  PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

let cachedAccessToken: string | null = null
let cachedTokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal environment variables are not configured.")
  }

  const now = Date.now()
  if (cachedAccessToken && cachedTokenExpiry > now + 60_000) {
    return cachedAccessToken
  }

  const creds = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")

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
    console.error("Failed to fetch PayPal access token:", res.status, text)
    throw new Error(`Failed to fetch PayPal access token: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedAccessToken = data.access_token
  cachedTokenExpiry = Date.now() + data.expires_in * 1000

  return cachedAccessToken
}

export async function createPayPalOrder(params: {
  amount: number
  currency: string
  customId: string
  description?: string
}) {
  const accessToken = await getAccessToken()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: params.currency,
            value: params.amount.toFixed(2),
          },
          custom_id: params.customId,
          description: params.description,
        },
      ],
      application_context: {
        return_url: `${siteUrl}/payment/paypal/return`,
        cancel_url: `${siteUrl}/payment/paypal/cancel`,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to create PayPal order:", res.status, text)
    throw new Error("Failed to create PayPal order")
  }

  return res.json()
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const accessToken = await getAccessToken()

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("Failed to capture PayPal order:", res.status, text)
    throw new Error("Failed to capture PayPal order")
  }

  return res.json()
}

