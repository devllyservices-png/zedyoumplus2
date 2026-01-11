import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, display_name, bio, location, phone } = await request.json()

    // Validate required fields
    if (!email || !password || !role || !display_name) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["buyer", "seller"].includes(role)) {
      return NextResponse.json(
        { error: "نوع الحساب غير صحيح" },
        { status: 400 }
      )
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      )
    }

    // Create user (suspended by default - admin needs to activate)
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        role,
        suspended: true, // New accounts are inactive by default, admin must activate
      })
      .select()
      .single()

    if (userError) {
      console.error("User creation error:", userError)
      return NextResponse.json(
        { error: "فشل في إنشاء المستخدم" },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        display_name,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        is_verified: false,
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up user if profile creation fails
      await supabase.from("users").delete().eq("id", user.id)
      return NextResponse.json(
        { error: "فشل في إنشاء الملف الشخصي" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
