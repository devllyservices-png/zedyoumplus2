"use client"

import type React from "react"
import { Suspense } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSuspended, setIsSuspended] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSuspended(false)

    if (!email || !password) {
      setError("يرجى ملء جميع الحقول")
      return
    }

    const result = await login(email, password)

    console.log('Login result:', result) // Debug log

    if (result.success) {
      // Check if user is admin
      console.log('User role:', result.user?.role) // Debug log
      if (result.user?.role === 'admin') {
        router.push("/admin/dashboard")
      } else {
        setError(`ليس لديك صلاحية للوصول إلى لوحة الإدارة. دورك الحالي: ${result.user?.role || 'غير محدد'}`)
      }
    } else {
      setError(result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة")
      setIsSuspended(result.suspended || false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo-large.png" alt="شعار المنصة" width={120} height={40} className="mx-auto mb-4" />
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
          </div>
          <p className="text-gray-300">تسجيل دخول المديرين فقط</p>
        </div>

        <Card className="shadow-2xl border-0 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">تسجيل دخول المدير</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className={isSuspended ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={isSuspended ? "text-orange-800" : "text-red-700"}>
                    {error}
                    {isSuspended && (
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-1">للحصول على المساعدة:</p>
                        <a 
                          href="mailto:support@zedyoumplus.com" 
                          className="text-orange-800 hover:text-orange-900 underline font-medium"
                        >
                          support@zedyoumplus.com
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    className="pr-10 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="pr-10 pl-10 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-lg font-medium"
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل دخول المدير"}
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                العودة إلى تسجيل الدخول العادي
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-gray-300 flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/images/logo-large.png" alt="شعار المنصة" width={120} height={40} className="mx-auto mb-4" />
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
            </div>
            <p className="text-gray-300">جاري التحميل...</p>
          </div>
          <Card className="shadow-2xl border-0 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
