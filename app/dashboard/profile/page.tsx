/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useActivityLog } from "@/contexts/activity-log-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileSettingsPage() {
  const { user, logout, refreshProfile } = useAuth()
  const { logAction } = useActivityLog()
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState("")
  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    location: "",
    phone: "",
    is_verified: false,
    rating: 0,
    completed_orders: 0,
    response_time: "",
    support_rate: "",
    languages: [] as string[],
  })
  const [currentLanguage, setCurrentLanguage] = useState("")
  const profileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const response = await fetch("/api/profile/me")
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile((prev) => ({ ...prev, ...data.profile }))
          }
        }
      } catch (error) {
        console.error("Profile load error:", error)
      }
    }
    load()
  }, [user])

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append("files", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message || "فشل رفع الصورة")
    }
    const data = await res.json()
    const url: string | undefined = data?.files?.[0]?.url
    if (!url) throw new Error("لا يوجد رابط صورة")
    return url
  }

  const onPickProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await uploadImage(file)
      setProfile((p) => ({ ...p, avatar_url: url }))
    } catch (e: any) {
      setError(e?.message || "تعذر رفع الصورة")
    } finally {
      setIsUploading(false)
      if (profileInputRef.current) profileInputRef.current.value = ""
    }
  }

  const save = async () => {
    if (!user) return
    setError("")
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          location: profile.location,
          phone: profile.phone,
          response_time: profile.response_time,
          support_rate: profile.support_rate,
          languages: profile.languages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "فشل حفظ البيانات")
      }

      await logAction("profile.update", { id: user.id })
      await refreshProfile() // Refresh profile data in context
      setSuccess("تم حفظ بيانات الملف الشخصي بنجاح")
      setTimeout(() => setSuccess(""), 2500)
    } catch (e: any) {
      setError(e?.message || "فشل حفظ البيانات")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!user) return
    if (!confirm("هل أنت متأكد من حذف الحساب؟ لا يمكن التراجع.")) return
    setError("")
    setIsSaving(true)
    try {
      // Delete profile first (cascade will handle user deletion)
      const { error: delErr } = await supabase.from("profiles").delete().eq("user_id", user.id)
      if (delErr) throw delErr
      await logAction("account.delete", { id: user.id })
      await logout()
      router.push("/")
    } catch (e: any) {
      setError(e?.message || "تعذر حذف الحساب")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">إعدادات الملف الشخصي</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="bg-transparent w-full sm:w-auto">
              <span className="sm:hidden">← عودة</span>
              <span className="hidden sm:inline">عودة للوحة التحكم</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">الملف الشخصي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
             {/* الصورة الشخصية */}
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-xl border">
               <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0">
                 <AvatarImage src={profile.avatar_url || "/images/avatar-fallback.svg"} alt={profile.display_name} />
                 <AvatarFallback className="text-lg sm:text-xl">{profile.display_name?.charAt(0) || "م"}</AvatarFallback>
               </Avatar>
               <div className="text-center sm:text-right">
                 <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.display_name}</h2>
                 <p className="text-sm sm:text-base text-gray-600 mt-1">{profile.bio || "لا توجد نبذة"}</p>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                   <span className="text-xs sm:text-sm text-gray-500">التقييم: {profile.rating}/5</span>
                   <span className="text-xs sm:text-sm text-gray-500">المشاريع المكتملة: {profile.completed_orders}</span>
                   {profile.is_verified && (
                     <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mx-auto sm:mx-0">✓ موثق</span>
                   )}
                 </div>
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">الاسم المعروض</Label>
                <Input value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} className="w-full h-11" />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">الهاتف</Label>
                <Input type="tel" value={profile.phone ?? ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="w-full h-11" />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">الموقع</Label>
                <Input value={profile.location ?? ""} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} className="w-full h-11" />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium">وقت الاستجابة</Label>
                <Input value={profile.response_time ?? ""} onChange={(e) => setProfile((p) => ({ ...p, response_time: e.target.value }))} placeholder="مثال: أقل من ساعة" className="w-full h-11" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">الصورة الشخصية</Label>
              <div className="mt-2 border rounded p-4 text-center">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                  <AvatarImage src={profile.avatar_url || "/images/avatar-fallback.svg"} alt={profile.display_name} />
                  <AvatarFallback className="text-lg sm:text-xl">{profile.display_name?.charAt(0) || "م"}</AvatarFallback>
                </Avatar>
                <input ref={profileInputRef} type="file" accept="image/*" onChange={onPickProfile} className="hidden" />
                <Button className="mt-3 w-full sm:w-auto" variant="outline" disabled={isUploading} onClick={() => profileInputRef.current?.click()}>
                  {isUploading ? "جاري الرفع..." : "تغيير الصورة"}
                </Button>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">نبذة</Label>
              <Textarea value={profile.bio ?? ""} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={4} className="w-full" />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">اللغات</Label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <Input 
                  value={currentLanguage} 
                  onChange={(e) => setCurrentLanguage(e.target.value)} 
                  placeholder="أضف لغة" 
                  className="flex-1 h-11"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (currentLanguage.trim()) {
                        setProfile((p) => ({ ...p, languages: [...(p.languages || []), currentLanguage.trim()] }))
                        setCurrentLanguage("")
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (currentLanguage.trim()) {
                      setProfile((p) => ({ ...p, languages: [...(p.languages || []), currentLanguage.trim()] }))
                      setCurrentLanguage("")
                    }
                  }}
                  className="w-full sm:w-auto h-11"
                >
                  إضافة
                </Button>
              </div>
              {profile.languages?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.languages.map((lang, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm">
                      {lang}
                      <button
                        onClick={() => setProfile((p) => ({ ...p, languages: p.languages?.filter((_, idx) => idx !== i) || [] }))}
                        className="mr-1 text-red-500 hover:text-red-700 text-lg leading-none p-1 -m-1 touch-manipulation cursor-pointer"
                        aria-label={`حذف ${lang}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={deleteAccount} disabled={isSaving || isUploading} className="w-full sm:w-auto order-2 sm:order-1 h-11">
                حذف الحساب
              </Button>
              <Button onClick={save} disabled={isSaving || isUploading} className="btn-gradient text-white w-full sm:w-auto order-1 sm:order-2 h-11">
                {isSaving ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}


