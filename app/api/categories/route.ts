import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

/** Public list of active service categories (home page, filters). */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select(
        "id, slug, title_ar, title_en, title_fr, description_ar, description_en, description_fr, icon_key, gradient, sort_order"
      )
      .eq("is_active", true)
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
  } catch (e) {
    console.error("Error in GET /api/categories:", e)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
