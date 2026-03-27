import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"
import {
  isAllowedGradient,
  isAllowedIconKey,
} from "@/lib/category-display"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.title_ar !== undefined) {
      const t = typeof body.title_ar === "string" ? body.title_ar.trim() : ""
      if (!t) {
        return NextResponse.json(
          { error: "title_ar cannot be empty" },
          { status: 400 }
        )
      }
      updates.title_ar = t
    }
    if (body.title_en !== undefined) {
      const t = typeof body.title_en === "string" ? body.title_en.trim() : ""
      if (!t) {
        return NextResponse.json(
          { error: "title_en cannot be empty" },
          { status: 400 }
        )
      }
      updates.title_en = t
    }
    if (body.title_fr !== undefined) {
      const t = typeof body.title_fr === "string" ? body.title_fr.trim() : ""
      if (!t) {
        return NextResponse.json(
          { error: "title_fr cannot be empty" },
          { status: 400 }
        )
      }
      updates.title_fr = t
    }
    if (body.description_ar !== undefined) {
      updates.description_ar = optionalDescription(body.description_ar)
    }
    if (body.description_en !== undefined) {
      updates.description_en = optionalDescription(body.description_en)
    }
    if (body.description_fr !== undefined) {
      updates.description_fr = optionalDescription(body.description_fr)
    }
    if (body.icon_key !== undefined) {
      const k =
        typeof body.icon_key === "string" ? body.icon_key.trim() : ""
      if (!k || !isAllowedIconKey(k)) {
        return NextResponse.json(
          { error: "icon_key is not a supported icon" },
          { status: 400 }
        )
      }
      updates.icon_key = k
    }
    if (body.gradient !== undefined) {
      const g =
        typeof body.gradient === "string" ? body.gradient.trim() : ""
      if (!g || !isAllowedGradient(g)) {
        return NextResponse.json(
          { error: "gradient is not a supported preset" },
          { status: 400 }
        )
      }
      updates.gradient = g
    }
    if (typeof body.sort_order === "number" && !Number.isNaN(body.sort_order)) {
      updates.sort_order = Math.floor(body.sort_order)
    }
    if (typeof body.is_active === "boolean") {
      updates.is_active = body.is_active
    }

    const { data, error } = await supabase
      .from("service_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating service_category:", error)
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error("Error in admin categories PATCH:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { data: row, error: fetchError } = await supabase
      .from("service_categories")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !row) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const { count, error: countError } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("category", row.slug)

    if (countError) {
      console.error("Error counting services for category:", countError)
      return NextResponse.json(
        { error: "Failed to verify category usage" },
        { status: 500 }
      )
    }

    const inUse = (count ?? 0) > 0

    if (inUse) {
      const { data: updated, error: softError } = await supabase
        .from("service_categories")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (softError) {
        console.error("Error soft-deleting service_category:", softError)
        return NextResponse.json(
          { error: "Failed to deactivate category" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        category: updated,
        deactivated: true,
        message:
          "التصنيف مستخدم في خدمات؛ تم إخفاؤه بدل الحذف.",
      })
    }

    const { error: delError } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id)

    if (delError) {
      console.error("Error deleting service_category:", delError)
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, deleted: true })
  } catch (error) {
    console.error("Error in admin categories DELETE:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
