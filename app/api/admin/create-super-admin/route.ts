import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 })
    }

    console.log('Creating super admin user...')
    
    // Super admin credentials
    const email = 'superadmin@zedyoumplus.com'
    const password = 'SuperAdmin123!'
    const displayName = 'Super Admin'
    
    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      return NextResponse.json({ 
        error: "Super admin already exists",
        credentials: {
          email,
          password,
          adminUrl: "/admin/login"
        }
      }, { status: 400 })
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Create user in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        password_hash: passwordHash,
        role: 'admin',
        suspended: false
      })
      .select()
      .single()
    
    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json({ error: "Failed to create user", details: userError }, { status: 500 })
    }
    
    console.log('✅ User created successfully:', user.email, 'Role:', user.role)
    
    // Create profile for the admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        display_name: displayName,
        phone: '+213000000000',
        location: 'Algeria',
        bio: 'Super Administrator of ZedYoum Plus Platform',
        avatar_url: null
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }
    
    console.log('✅ Profile created successfully:', profile.display_name)
    
    return NextResponse.json({
      success: true,
      message: "Super admin created successfully!",
      credentials: {
        email,
        password,
        displayName,
        adminUrl: "/admin/login"
      },
      warning: "Please change the password after first login!"
    })
    
  } catch (error) {
    console.error('Error creating super admin:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
