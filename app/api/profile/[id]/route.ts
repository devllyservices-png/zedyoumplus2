import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      )
    }

    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", id)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: "الملف الشخصي غير موجود" },
        { status: 404 }
      )
    }

    // Get user data (public info only)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, role, created_at")
      .eq("id", id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        created_at: userData.created_at,
      },
      profile: profileData,
    })
  } catch (error) {
    console.error("Get profile by ID error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
