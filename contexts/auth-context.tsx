"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  userType: "buyer" | "seller" | "admin"
  phone?: string
  location?: string
  joinedDate: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  userType: "buyer" | "seller"
  phone?: string
  location?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check existing session and load profile
  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.user) {
        await loadUser(sessionData.session.user.id, sessionData.session.user.email!)
      }
      setIsLoading(false)
    }
    getSession()
  }, [])

  const loadUser = async (id: string, email: string) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()
    if (profile) {
      setUser({
        id,
        name: profile.name,
        email,
        userType: profile.user_type,
        phone: profile.phone,
        location: profile.location,
        joinedDate: profile.joined_date,
        isVerified: profile.is_verified,
      })
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return false

      await loadUser(data.user.id, data.user.email!)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (error || !data.user) return false

      // Insert into profiles table
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: userData.name,
        user_type: userData.userType,
        phone: userData.phone,
        location: userData.location,
        is_verified: false,
      })

      if (profileError) return false

      await loadUser(data.user.id, userData.email)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
