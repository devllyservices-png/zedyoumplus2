import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json()

    // Validate required fields
    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const email = 'superadmin@zedyoumplus.com'

    // Use service role key if available, otherwise use regular client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminSupabase = serviceRoleKey 
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase

    // Check if admin exists
    const { data: existingUser, error: userCheckError } = await adminSupabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single()
    
    if (userCheckError || !existingUser) {
      return NextResponse.json({ 
        error: "Super admin user not found",
        details: userCheckError
      }, { status: 404 })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    
    // Update password in users table
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({
        password_hash: passwordHash
      })
      .eq('email', email)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ 
        error: "Failed to update password", 
        details: updateError 
      }, { status: 500 })
    }
    
    console.log('✅ Password updated successfully for:', email)

    return NextResponse.json({
      success: true,
      message: "Super admin password updated successfully!",
      email: email,
      note: "Please use the new password to login"
    })
    
  } catch (error) {
    console.error('Error updating super admin password:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
