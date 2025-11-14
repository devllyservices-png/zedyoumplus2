"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function RegisterPage() {
  const { t, mounted } = useTranslation()
  const [formData, setFormData] = useState({
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as "buyer" | "seller" | "",
    phone: "",
    location: "",
    bio: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const { register, isLoading } = useAuth()
  const router = useRouter()

  // Wait for client-side hydration to complete
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/images/logo-large.png" alt={t.header.logoAlt} width={120} height={40} className="mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t.register.title}</h1>
            <p className="text-gray-600 mt-2">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.display_name || !formData.email || !formData.password || !formData.role) {
      setError(t.register.errors.fillFields)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.register.errors.passwordMismatch)
      return
    }

    if (formData.password.length < 6) {
      setError(t.register.errors.passwordLength)
      return
    }

    if (!acceptTerms) {
      setError(t.register.errors.acceptTerms)
      return
    }

    const success = await register({
      display_name: formData.display_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
    })

    if (success) {
      router.push("/dashboard")
    } else {
      setError(t.register.errors.createError)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/logo-large.png" alt={t.header.logoAlt} width={120} height={40} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t.register.title}</h1>
          <p className="text-gray-600 mt-2">{t.register.subtitle}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold">{t.register.formTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-medium">
                  {t.register.displayName} *
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => updateFormData("display_name", e.target.value)}
                    placeholder={t.register.displayNamePlaceholder}
                    className="pr-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t.register.email} *
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder={t.register.emailPlaceholder}
                    className="pr-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  {t.register.role} *
                </Label>
                <Select value={formData.role} onValueChange={(value) => updateFormData("role", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t.register.rolePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">{t.register.roleBuyer}</SelectItem>
                    <SelectItem value="seller">{t.register.roleSeller}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t.register.password} *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder={t.register.passwordPlaceholder}
                      className="pr-10 pl-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t.register.confirmPassword} *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      placeholder={t.register.confirmPasswordPlaceholder}
                      className="pr-10 pl-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  {t.register.bio}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  placeholder={t.register.bioPlaceholder}
                  rows={3}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t.register.phone}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+213 555 123 456"
                      className="pr-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    {t.register.location}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      placeholder={t.register.locationPlaceholder}
                      className="pr-10 h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  {t.register.acceptTerms}{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    {t.register.terms}
                  </Link>{" "}
                  {t.register.and}{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    {t.register.privacy}
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient text-white h-12 text-lg font-medium"
              >
                {isLoading ? t.register.submitting : t.register.submit}
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t.register.hasAccount}{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  {t.register.signIn}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {t.register.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
