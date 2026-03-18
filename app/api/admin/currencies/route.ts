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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .order("code", { ascending: true })

    if (error) {
      console.error("Error fetching currencies:", error)
      return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
    }

    return NextResponse.json({
      currencies: data || [],
    })
  } catch (error) {
    console.error("Error in admin currencies GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currencies } = body as { currencies: Array<any> }

    if (!Array.isArray(currencies)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Normalize payload: uppercase codes, ensure booleans/numbers
    const normalized = currencies
      .map((c) => ({
        code: (c.code || "").toString().trim().toUpperCase(),
        name: (c.name || "").toString().trim(),
        rate_to_eur: Number(c.rate_to_eur) || 0,
        is_default: Boolean(c.is_default),
        is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
      }))
      .filter((c) => c.code && c.name && c.rate_to_eur > 0)

    if (normalized.length === 0) {
      return NextResponse.json({ error: "No valid currencies provided" }, { status: 400 })
    }

    // Ensure exactly one default (if none set, fall back to EUR)
    const hasDefault = normalized.some((c) => c.is_default)
    if (!hasDefault) {
      normalized.forEach((c) => {
        c.is_default = c.code === "EUR"
      })
    }

    // Upsert currencies
    const { error: upsertError } = await supabase.from("currencies").upsert(
      normalized.map((c) => ({
        code: c.code,
        name: c.name,
        rate_to_eur: c.rate_to_eur,
        is_default: c.is_default,
        is_active: c.is_active,
      })),
      { onConflict: "code" }
    )

    if (upsertError) {
      console.error("Error upserting currencies:", upsertError)
      return NextResponse.json({ error: "Failed to save currencies" }, { status: 500 })
    }

    // Re-fetch updated list
    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .order("code", { ascending: true })

    if (error) {
      console.error("Error refetching currencies:", error)
      return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      currencies: data || [],
    })
  } catch (error) {
    console.error("Error in admin currencies POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

