"use client"

import type React from "react"
import { Suspense } from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"
import { WhatsAppButton } from "@/components/whatsapp-button"

function LoginForm() {
  const { t, mounted } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSuspended, setIsSuspended] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect")

  // Wait for client-side hydration to complete
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/images/logo-large.png" alt={t.header.logoAlt} width={120} height={40} className="mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t.login.title}</h1>
            <p className="text-gray-600 mt-2">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSuspended(false)

    if (!email || !password) {
      setError(t.login.errors.fillFields)
      return
    }

    const result = await login(email, password)

    if (result.success) {
      // Redirect to the intended page or default to dashboard
      const destination = redirectUrl || "/dashboard"
      router.push(destination)
    } else {
      setError(result.error || t.login.errors.invalidCredentials)
      setIsSuspended(result.suspended || false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo-large.png" alt={t.header.logoAlt} width={120} height={40} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.login.title}</h1>
          <p className="text-gray-600 mt-2">{t.login.subtitle}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">{t.login.formTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className={isSuspended ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={isSuspended ? "text-orange-800" : "text-red-700"}>
                    {error}
                    {isSuspended && (
                      <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-2">{t.login.errors.suspendedHelp}</p>
                        <div className="flex flex-col gap-2">
                          <a 
                            href="mailto:support@zedyoumplus.com" 
                            className="text-orange-800 hover:text-orange-900 underline font-medium"
                          >
                            support@zedyoumplus.com
                          </a>
                          <div className="flex items-center gap-2">
                            <WhatsAppButton size={24} phoneNumber="+213557469113" />
                            <a 
                              href="https://wa.me/213557469113" 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-800 hover:text-orange-900 underline font-medium"
                            >
                              واتساب: +213 557 46 91 13
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t.login.email}
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                    className="pr-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t.login.password}
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className="pr-10 pl-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  {t.login.forgotPassword}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient text-white h-12 text-lg font-medium"
              >
                {isLoading ? t.login.submitting : t.login.submit}
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t.login.noAccount}{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t.login.signUp}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {t.login.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/images/logo-large.png" alt="Logo" width={120} height={40} className="mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
            <p className="text-gray-600 mt-2">جاري التحميل...</p>
          </div>
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
