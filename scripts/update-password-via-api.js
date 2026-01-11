// Script to update super admin password via API route
const http = require('http')

const data = JSON.stringify({
  newPassword: 'admin12345'
})

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/update-super-admin-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

console.log('Attempting to update super admin password via API...')
console.log('Make sure your Next.js dev server is running on port 3000')
console.log('If not, run: npm run dev')

const req = http.request(options, (res) => {
  let responseData = ''

  res.on('data', (chunk) => {
    responseData += chunk
  })

  res.on('end', () => {
    try {
      const json = JSON.parse(responseData)
      if (json.success) {
        console.log('\n🎉 Super admin password updated successfully!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📧 Email: superadmin@zedyoumplus.com')
        console.log('🔑 New Password: admin12345')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      } else {
        console.error('❌ Error:', json.error || 'Unknown error')
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', responseData)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Request error:', error.message)
  console.error('Make sure the Next.js dev server is running!')
})

req.write(data)
req.end()
