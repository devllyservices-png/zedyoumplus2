import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  // Get JWT token from cookies
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    // Verify JWT token
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
    
    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      )
    }

    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.userId)
      .single()

    // If profile doesn't exist, create a default one
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create a default one
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.userId,
          display_name: user.email.split('@')[0], // Use email prefix as default name
          is_verified: false,
          rating: 0.0,
          completed_orders: 0
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating default profile:", createError)
        return NextResponse.json(
          { error: "فشل في إنشاء الملف الشخصي" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          created_at: userData.created_at,
        },
        profile: newProfile,
      })
    } else if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json(
        { error: "فشل في جلب بيانات الملف الشخصي" },
        { status: 500 }
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
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول" },
        { status: 401 }
      )
    }

    const { display_name, bio, avatar_url, location, phone, response_time, support_rate, languages } = await request.json()

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name,
        bio: bio || null,
        avatar_url: avatar_url || null,
        location: location || null,
        phone: phone || null,
        response_time: response_time || null,
        support_rate: support_rate || null,
        languages: languages || [],
      })
      .eq("user_id", user.userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json(
        { error: "فشل في تحديث الملف الشخصي" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}
