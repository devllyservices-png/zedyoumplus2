// Simple script to create super admin
// Run this in your browser console on your app, or use it as a reference

const superAdminData = {
  email: 'superadmin@zedyoumplus.com',
  password: 'SuperAdmin123!',
  displayName: 'Super Admin',
  phone: '+213000000000',
  location: 'Algeria',
  bio: 'Super Administrator of ZedYoum Plus Platform'
}

console.log('🎉 Super Admin Credentials:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📧 Email:', superAdminData.email)
console.log('🔑 Password:', superAdminData.password)
console.log('👤 Name:', superAdminData.displayName)
console.log('🔗 Admin Login URL: http://localhost:3000/admin/login')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n📝 To create this user manually:')
console.log('1. Go to your Supabase dashboard')
console.log('2. Navigate to Table Editor → users')
console.log('3. Insert a new row with:')
console.log('   - email: superadmin@zedyoumplus.com')
console.log('   - password_hash: (use bcrypt to hash "SuperAdmin123!")')
console.log('   - role: admin')
console.log('   - suspended: false')
console.log('4. Then go to profiles table and insert:')
console.log('   - user_id: (the ID from step 3)')
console.log('   - display_name: Super Admin')
console.log('   - phone: +213000000000')
console.log('   - location: Algeria')
console.log('   - bio: Super Administrator of ZedYoum Plus Platform')
console.log('\n⚠️  Remember to change the password after first login!')
