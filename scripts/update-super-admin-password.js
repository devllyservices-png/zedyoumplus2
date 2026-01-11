const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from:', envPath)
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split(/\r?\n/).forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        process.env[key] = value
        console.log(`Loaded: ${key}`)
      }
    }
  })
} else {
  console.log('Warning: .env.local file not found at:', envPath)
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateSuperAdminPassword() {
  try {
    const email = 'superadmin@zedyoumplus.com'
    const newPassword = 'admin12345'
    
    console.log('Updating super admin password...')
    console.log('Email:', email)
    console.log('New Password:', newPassword)
    
    // Check if admin exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single()
    
    if (userCheckError || !existingUser) {
      console.error('❌ Super admin user not found')
      console.error('Error:', userCheckError)
      return
    }

    console.log('✅ Found user:', existingUser.email, 'Role:', existingUser.role)
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    console.log('✅ Password hashed successfully')
    
    // Update password in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash
      })
      .eq('email', email)

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return
    }
    
    console.log('\n🎉 Super admin password updated successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)
    console.log('🔑 New Password:', newPassword)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Please use the new password to login!')
    
  } catch (error) {
    console.error('❌ Error updating super admin password:', error)
  }
}

updateSuperAdminPassword()
