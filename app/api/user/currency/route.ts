import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId, email: decoded.email, role: decoded.role }
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    let code: string | undefined

    if (user) {
      // Try to get user's preference
      const { data: pref } = await supabase
        .from("user_currency_preferences")
        .select("currency_code")
        .eq("user_id", user.userId)
        .single()

      code = pref?.currency_code as string | undefined
    }

    if (!code) {
      // Fallback to default currency
      const { data: defaultCurrency } = await supabase
        .from("currencies")
        .select("code")
        .eq("is_default", true)
        .single()

      code = defaultCurrency?.code || "EUR"
    }

    // Return selected currency details
    const { data: currency } = await supabase
      .from("currencies")
      .select("*")
      .eq("code", code)
      .single()

    // Also return list of active currencies for selectors
    const { data: activeCurrencies } = await supabase
      .from("currencies")
      .select("*")
      .eq("is_active", true)
      .order("code", { ascending: true })

    return NextResponse.json({
      currency: currency || null,
      availableCurrencies: activeCurrencies || [],
    })
  } catch (error) {
    console.error("Error in user currency GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body as { code?: string }

    if (!code) {
      return NextResponse.json({ error: "Currency code is required" }, { status: 400 })
    }

    const normalizedCode = code.trim().toUpperCase()

    // Ensure currency exists and is active
    const { data: currency, error: currencyError } = await supabase
      .from("currencies")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single()

    if (currencyError || !currency) {
      return NextResponse.json({ error: "Invalid or inactive currency" }, { status: 400 })
    }

    // Upsert preference
    const { error: upsertError } = await supabase.from("user_currency_preferences").upsert(
      {
        user_id: user.userId,
        currency_code: normalizedCode,
      },
      {
        onConflict: "user_id",
      }
    )

    if (upsertError) {
      console.error("Error saving user currency preference:", upsertError)
      return NextResponse.json({ error: "Failed to save preference" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      currency,
    })
  } catch (error) {
    console.error("Error in user currency PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

