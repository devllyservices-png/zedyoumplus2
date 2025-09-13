import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" },
        { status: 400 }
      )
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )
    console.log("User logged in:", user.email)
    console.log("JWT Secret length:", JWT_SECRET.length)
    console.log("Token created:", token.substring(0, 20) + "...")
    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      profile: profile || null,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
