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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, CreditCard, FileText, XCircle, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"
import { useActivityLog } from "@/contexts/activity-log-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SellerPublicStoreLink } from "@/components/seller-public-store-link"

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Days left (ceil) + progress through current period [0,100]. */
function getSubscriptionDaysAndProgress(active: {
  startsAt?: string | null
  endsAt?: string | null
} | null) {
  if (!active?.startsAt || !active?.endsAt) {
    return { daysLeft: null as number | null, progressPercent: 0 }
  }
  const start = new Date(active.startsAt).getTime()
  const end = new Date(active.endsAt).getTime()
  const now = Date.now()
  const totalMs = end - start
  if (totalMs <= 0) return { daysLeft: 0, progressPercent: 100 }
  const dayMs = 24 * 60 * 60 * 1000
  const daysLeft = Math.max(0, Math.ceil((end - now) / dayMs))
  const elapsedMs = now - start
  const progressPercent = clamp((elapsedMs / totalMs) * 100, 0, 100)
  return { daysLeft, progressPercent }
}

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

  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [activePlans, setActivePlans] = useState<Array<{ id: string; name: string; price_eur: number; duration_months: number; is_default: boolean }>>([])
  const [subscriptionTab, setSubscriptionTab] = useState<"status" | "invoices">("status")

  useEffect(() => {
    if (typeof window === "undefined") return
    const t = new URLSearchParams(window.location.search).get("subscriptionTab")
    if (t === "invoices") setSubscriptionTab("invoices")
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const onPopState = () => {
      const t = new URLSearchParams(window.location.search).get("subscriptionTab")
      setSubscriptionTab(t === "invoices" ? "invoices" : "status")
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const handleSubscriptionTabChange = (value: string) => {
    const next = value === "invoices" ? "invoices" : "status"
    setSubscriptionTab(next)
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    )
    if (next === "invoices") params.set("subscriptionTab", "invoices")
    else params.delete("subscriptionTab")
    const qs = params.toString()
    router.replace(`/dashboard/profile${qs ? `?${qs}` : ""}`, { scroll: false })
  }

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user || user.role !== "seller" || !user.id) return
      setSubscriptionLoading(true)
      try {
        const res = await fetch("/api/subscriptions/me", {
          credentials: "include",
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setSubscriptionData(null)
          return
        }
        setSubscriptionData(data)
      } catch {
        setSubscriptionData(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    void loadSubscription()
  }, [user])

  useEffect(() => {
    const loadPlans = async () => {
      if (!user || user.role !== "seller") return
      try {
        const res = await fetch("/api/subscription-plans/active", { credentials: "include" })
        const data = await res.json().catch(() => ({}))
        if (res.ok && Array.isArray(data.plans)) {
          setActivePlans(data.plans)
        }
      } catch {}
    }
    void loadPlans()
  }, [user])

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
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
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

        {user?.role === "seller" && user?.id ? (
          <SellerPublicStoreLink sellerId={user.id} />
        ) : null}

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

        {user?.role === "seller" && (
          <Card className="mt-8 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/70">
            <CardHeader className="border-b border-gray-100/90 bg-white/70 backdrop-blur-sm pb-5">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500 shrink-0" aria-hidden />
                  اشتراك المتجر
                  <span className="text-base sm:text-lg font-semibold text-gray-500">/ Store subscription</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  إدارة الاشتراك وفواتيرك — Manage your subscription and invoices
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {subscriptionLoading ? (
                <div
                  className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white/80 px-4 text-gray-600"
                  role="status"
                  aria-live="polite"
                >
                  <div className="h-9 w-9 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                  <span>جاري تحميل حالة الاشتراك… / Loading subscription…</span>
                </div>
              ) : (
                <>
                  <Tabs value={subscriptionTab} onValueChange={handleSubscriptionTabChange} className="w-full">
                    <TabsList className="grid w-full max-w-xl grid-cols-2 gap-2 h-auto rounded-xl border border-gray-200/80 bg-muted/50 p-1.5">
                      <TabsTrigger value="status" className="rounded-lg py-2.5 text-sm sm:text-base">
                        الحالة / Status
                      </TabsTrigger>
                      <TabsTrigger value="invoices" className="rounded-lg py-2.5 text-sm sm:text-base">
                        الفواتير / Invoices
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="status" className="mt-6 space-y-5 focus-visible:outline-none">
                      {(() => {
                        const active = subscriptionData?.activeSubscription as
                          | { startsAt?: string; endsAt?: string }
                          | null
                          | undefined
                        const { daysLeft, progressPercent } = getSubscriptionDaysAndProgress(active ?? null)
                        const endsAt = active?.endsAt ? new Date(active.endsAt) : null
                        const hasActive = Boolean(active?.endsAt && endsAt && endsAt.getTime() > Date.now())

                        return (
                          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
                              <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  {hasActive ? (
                                    <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-50">
                                      نشط / Active
                                    </Badge>
                                  ) : (
                                    <Badge className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-800 hover:bg-red-50">
                                      غير نشط / Inactive
                                    </Badge>
                                  )}
                                  {subscriptionData?.pendingInvoice ? (
                                    <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-900 hover:bg-amber-50">
                                      بانتظار الدفع/المراجعة / Awaiting payment/review
                                    </Badge>
                                  ) : null}
                                </div>

                                {hasActive && daysLeft !== null ? (
                                  <div className="space-y-1">
                                    <div className="text-4xl font-bold tabular-nums text-emerald-700 sm:text-5xl">
                                      {daysLeft}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                      يوم متبقٍ في هذه الفترة / days left in this period
                                    </p>
                                    {endsAt ? (
                                      <p className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                                        <CalendarDays className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                                        <span>
                                          ينتهي في / Expires:{" "}
                                          <span className="font-semibold text-gray-800">
                                            {endsAt.toLocaleDateString("ar-DZ")} ·{" "}
                                            {endsAt.toLocaleDateString("en-GB")}
                                          </span>
                                        </span>
                                      </p>
                                    ) : null}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    متجرك وخدماتك غير مفعّلة حالياً. ادفع/جدّد الاشتراك لتفعيلها مباشرة (PayPal) أو حسب
                                    طريقة الدفع المختارة.
                                  </p>
                                )}

                                {hasActive && daysLeft !== null ? (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                      <span>تقدّم الفترة / Period progress</span>
                                      <span className="tabular-nums">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div
                                      className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
                                      role="progressbar"
                                      aria-valuenow={Math.round(progressPercent)}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    >
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-[width] duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex w-full flex-col justify-center gap-3 rounded-xl border border-gray-100 bg-slate-50/80 p-4 lg:max-w-xs">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                  الاشتراك الأساسي / Basic plan
                                </p>
                                {(() => {
                                  const def = activePlans.find((p) => p.is_default) || activePlans[0]
                                  return def ? (
                                    <p className="text-sm text-gray-800">
                                      <span className="font-semibold">{def.name}</span> —{" "}
                                      <span className="font-semibold">{def.duration_months} شهر</span> —{" "}
                                      <span className="font-semibold">{Number(def.price_eur).toFixed(2)} EUR</span>
                                    </p>
                                  ) : (
                                    <p className="text-sm text-gray-800">لا توجد خطط مفعلة من الإدارة حالياً.</p>
                                  )
                                })()}
                                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                                  <Button
                                    onClick={() => router.push("/subscriptions/checkout")}
                                    className="btn-gradient h-11 w-full text-white"
                                  >
                                    <CreditCard className="ml-2 h-4 w-4" />
                                    ادفع / جدد · Pay / Renew
                                  </Button>
                                  {subscriptionData?.pendingInvoice ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="h-11 w-full border-amber-300 bg-amber-50/80 text-amber-950 hover:bg-amber-100"
                                      onClick={() => handleSubscriptionTabChange("invoices")}
                                    >
                                      <FileText className="ml-2 h-4 w-4" />
                                      عرض الفواتير / View invoices
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                      {!subscriptionData?.activeSubscription ? (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="flex items-start gap-2 text-red-950">
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                            <span>
                              اشتراكك غير مفعّل. ادفع أو جدّد لعرض متجرك وخدماتك. / Subscription inactive — pay or renew
                              to show your store and services.
                            </span>
                          </AlertDescription>
                        </Alert>
                      ) : null}

                      {subscriptionData?.pendingInvoice ? (
                        <Alert className="border-amber-200 bg-amber-50">
                          <AlertDescription className="flex items-start gap-2 text-amber-950">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                            <span>
                              لديك فاتورة اشتراك قيد الانتظار.
                              الحالة / Status:{" "}
                              <span className="font-semibold">
                                {subscriptionData.pendingInvoice.status === "paid"
                                  ? "مدفوع"
                                  : "معلق"}
                              </span>
                            </span>
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </TabsContent>

                    <TabsContent value="invoices" className="mt-6 focus-visible:outline-none">
                      <div className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white shadow-inner">
                        <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                          <p className="text-sm font-semibold text-gray-900">سجل الفواتير / Invoice history</p>
                          <p className="text-xs text-gray-500">آخر 30 فاتورة / Last 30 invoices</p>
                        </div>
                        <div className="min-h-[280px] w-full min-w-0 p-3 sm:p-4">
                          <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-gray-100 bg-slate-50/40">
                            {subscriptionData?.invoices?.length ? (
                              <Table className="w-full min-w-[640px] table-fixed sm:min-w-0 sm:table-auto">
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px] font-semibold">المعرف / ID</TableHead>
                                    <TableHead className="font-semibold">التاريخ / Date</TableHead>
                                    <TableHead className="font-semibold">المبلغ / Amount</TableHead>
                                    <TableHead className="font-semibold">الطريقة / Method</TableHead>
                                    <TableHead className="font-semibold">الحالة / Status</TableHead>
                                    <TableHead className="hidden md:table-cell font-semibold">الفترة / Period</TableHead>
                                    <TableHead className="w-[120px] text-end font-semibold">إيصال / Proof</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {subscriptionData.invoices.map((inv: any) => (
                                    <TableRow key={inv.id} className="border-gray-100">
                                      <TableCell className="font-mono text-xs align-middle">
                                        {inv.id.slice(0, 8)}…
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap text-gray-700 align-middle text-sm">
                                        {inv.createdAt
                                          ? new Date(inv.createdAt).toLocaleDateString("ar-DZ")
                                          : "—"}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap font-semibold align-middle text-sm">
                                        {Number(inv.amountDzd || 0).toLocaleString()} دج
                                      </TableCell>
                                      <TableCell className="max-w-[140px] truncate text-gray-700 align-middle text-sm">
                                        {inv.paymentMethod || "—"}
                                      </TableCell>
                                      <TableCell className="align-middle">
                                        <Badge
                                          className={
                                            inv.status === "approved"
                                              ? "border border-green-200 bg-green-100 text-green-800"
                                              : inv.status === "rejected"
                                                ? "border border-red-200 bg-red-100 text-red-800"
                                                : inv.status === "paid"
                                                  ? "border border-blue-200 bg-blue-100 text-blue-800"
                                                  : "border border-amber-200 bg-amber-100 text-amber-900"
                                          }
                                        >
                                          {inv.status === "approved"
                                            ? "موافق / approved"
                                            : inv.status === "rejected"
                                              ? "مرفوض / rejected"
                                              : inv.status === "paid"
                                                ? "مدفوع / paid"
                                                : "معلق / pending"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="hidden max-w-[200px] text-gray-700 align-middle text-xs md:table-cell">
                                        {inv.periodStartAt && inv.periodEndAt
                                          ? `${new Date(inv.periodStartAt).toLocaleDateString("ar-DZ")} – ${new Date(inv.periodEndAt).toLocaleDateString("ar-DZ")}`
                                          : "—"}
                                      </TableCell>
                                      <TableCell className="text-end align-middle">
                                        {inv.paymentProofUrl ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.open(inv.paymentProofUrl, "_blank")}
                                            className="border-gray-300 bg-white"
                                          >
                                            <FileText className="ml-1 h-4 w-4" />
                                            إيصال
                                          </Button>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-12 text-center text-gray-600">
                                <FileText className="h-10 w-10 text-gray-300" aria-hidden />
                                <p>لا توجد فواتير بعد. / No invoices yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  )
}


