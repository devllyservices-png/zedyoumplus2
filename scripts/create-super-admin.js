const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSuperAdmin() {
  try {
    console.log('Creating super admin user...')
    
    // Super admin credentials
    const email = 'superadmin@zedyoumplus.com'
    const password = 'SuperAdmin123!'
    const displayName = 'Super Admin'
    
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
      return
    }
    
    console.log('✅ User created successfully:', user.email)
    
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
      return
    }
    
    console.log('✅ Profile created successfully:', profile.display_name)
    
    console.log('\n🎉 Super Admin created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', displayName)
    console.log('🔗 Admin Login URL: http://localhost:3000/admin/login')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Please change the password after first login!')
    
  } catch (error) {
    console.error('Error creating super admin:', error)
  }
}

// Run the script
createSuperAdmin()
