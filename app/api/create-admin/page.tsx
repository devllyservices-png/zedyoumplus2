"use client"

import { useState } from "react"

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const createSuperAdmin = async () => {
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch('/api/admin/create-super-admin', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to create super admin')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Create Super Admin
          </h1>
          
          <button
            onClick={createSuperAdmin}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Creating..." : "Create Super Admin"}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">✅ Success!</h3>
              <div className="text-white space-y-2">
                <p><strong>Email:</strong> {result.credentials.email}</p>
                <p><strong>Password:</strong> {result.credentials.password}</p>
                <p><strong>Name:</strong> {result.credentials.displayName}</p>
                <p><strong>Admin URL:</strong> 
                  <a href={result.credentials.adminUrl} className="text-purple-400 hover:underline ml-2">
                    {result.credentials.adminUrl}
                  </a>
                </p>
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ {result.warning}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <h3 className="text-red-400 font-semibold mb-2">❌ Error</h3>
              <p className="text-white">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <a 
              href="/admin/login" 
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Go to Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
