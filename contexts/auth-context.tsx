"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  id: string
  email: string
  role: "buyer" | "seller" | "admin"
  created_at: string
}

interface Profile {
  id: string
  user_id: string
  display_name: string
  bio?: string
  avatar_url?: string
  location?: string
  phone?: string
  is_verified: boolean
  rating: number
  completed_orders: number
  member_since: string
  response_time?: string
  support_rate?: string
  languages?: string[]
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean
}

interface RegisterData {
  email: string
  password: string
  role: "buyer" | "seller"
  display_name: string
  bio?: string
  location?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<Record<string, any>>({})

  // Check existing session and load user + profile
  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch("/api/profile/me", {
          credentials: 'include', // Important for cookies
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setProfile(data.profile)
          
          // Load permissions based on user role
          if (data.user?.role) {
            const userPermissions = getPermissionsForRole(data.user.role)
            setPermissions(userPermissions)
          }
        } else {
          console.log("No valid session found")
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getSession()
  }, [])

  // Helper function to get permissions for a role
  const getPermissionsForRole = (role: string) => {
    const permissions: Record<string, boolean> = {}
    
    if (role === 'seller') {
      permissions['service_create'] = true
      permissions['service_read'] = true
      permissions['service_update'] = true
      permissions['service_delete'] = true
      permissions['digital_product_create'] = false
      permissions['digital_product_read'] = true
      permissions['digital_product_update'] = false
      permissions['digital_product_delete'] = false
    } else if (role === 'buyer') {
      permissions['service_create'] = false
      permissions['service_read'] = true
      permissions['service_update'] = false
      permissions['service_delete'] = false
      permissions['digital_product_create'] = false
      permissions['digital_product_read'] = true
      permissions['digital_product_update'] = false
      permissions['digital_product_delete'] = false
    } else if (role === 'admin') {
      permissions['service_create'] = true
      permissions['service_read'] = true
      permissions['service_update'] = true
      permissions['service_delete'] = true
      permissions['digital_product_create'] = true
      permissions['digital_product_read'] = true
      permissions['digital_product_update'] = true
      permissions['digital_product_delete'] = true
    }
    
    return permissions
  }


  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) return false

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setProfile(data.profile)
        
        // Set permissions based on user role
        if (data.user?.role) {
          const userPermissions = getPermissionsForRole(data.user.role)
          setPermissions(userPermissions)
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) return false

      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        // Profile will be loaded on next login
        return true
      }
      return false
    } catch (error) {
      console.error("Register error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    // Clear the auth cookie by setting it to expire
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setUser(null)
    setProfile(null)
    setPermissions({})
  }

  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    return permissions[`${resource}_${action}`] || false
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
