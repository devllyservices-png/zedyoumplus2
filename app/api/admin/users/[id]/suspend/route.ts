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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { suspended } = await request.json()
    const userId = params.id

    // Update user suspension status
    const { data, error } = await supabase
      .from('users')
      .update({ suspended })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user suspension:', error)
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
    }

    console.log(`User ${userId} ${suspended ? 'suspended' : 'unsuspended'} by admin ${user.email}`)

    return NextResponse.json({
      success: true,
      message: `تم ${suspended ? 'تعليق' : 'إلغاء تعليق'} الحساب بنجاح`,
      user: data
    })

  } catch (error) {
    console.error('Error in suspend user API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
