import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import {
  isAllowedGradient,
  isAllowedIconKey,
} from "@/lib/category-display"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function optionalDescription(v: unknown): string | null {
  if (v === undefined || v === null) return null
  if (typeof v !== "string") return null
  const t = v.trim()
  return t ? t : null
}

async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch {
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
      .from("service_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("title_ar", { ascending: true })

    if (error) {
      console.error("Error fetching service_categories:", error)
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      )
    }

    return NextResponse.json({ categories: data ?? [] })
  } catch (error) {
    console.error("Error in admin categories GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const slugRaw = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""
    const title_ar =
      typeof body.title_ar === "string" ? body.title_ar.trim() : ""
    const title_en =
      typeof body.title_en === "string" ? body.title_en.trim() : ""
    const title_fr =
      typeof body.title_fr === "string" ? body.title_fr.trim() : ""
    const description_ar = optionalDescription(body.description_ar)
    const description_en = optionalDescription(body.description_en)
    const description_fr = optionalDescription(body.description_fr)
    const iconKeyRaw =
      typeof body.icon_key === "string" ? body.icon_key.trim() : "Palette"
    const gradientRaw =
      typeof body.gradient === "string"
        ? body.gradient.trim()
        : "from-pink-500 to-purple-600"
    const sort_order =
      typeof body.sort_order === "number" && !Number.isNaN(body.sort_order)
        ? Math.floor(body.sort_order)
        : 0

    if (!title_ar || !title_en || !title_fr) {
      return NextResponse.json(
        { error: "title_ar, title_en, and title_fr are required" },
        { status: 400 }
      )
    }
    if (!slugRaw || !SLUG_REGEX.test(slugRaw)) {
      return NextResponse.json(
        {
          error:
            "slug must be lowercase letters, numbers, and single hyphens between segments (e.g. design, web-dev)",
        },
        { status: 400 }
      )
    }
    if (!isAllowedIconKey(iconKeyRaw)) {
      return NextResponse.json(
        { error: "icon_key is not a supported icon" },
        { status: 400 }
      )
    }
    if (!isAllowedGradient(gradientRaw)) {
      return NextResponse.json(
        { error: "gradient is not a supported preset" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from("service_categories")
      .select("id")
      .eq("slug", slugRaw)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("service_categories")
      .insert({
        slug: slugRaw,
        title_ar,
        title_en,
        title_fr,
        description_ar,
        description_en,
        description_fr,
        icon_key: iconKeyRaw,
        gradient: gradientRaw,
        sort_order,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting service_category:", error)
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 500 }
      )
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error("Error in admin categories POST:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
