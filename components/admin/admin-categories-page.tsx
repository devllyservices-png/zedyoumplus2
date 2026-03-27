"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react"
import {
  CATEGORY_GRADIENT_PRESETS,
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
} from "@/lib/category-display"

export type ServiceCategoryRow = {
  id: string
  slug: string
  title_ar: string
  title_en: string
  title_fr: string
  description_ar: string | null
  description_en: string | null
  description_fr: string | null
  icon_key: string
  gradient: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const DEFAULT_ICON = "Palette"
const DEFAULT_GRADIENT = "from-pink-500 to-purple-600"

const emptyForm = {
  slug: "",
  title_ar: "",
  title_en: "",
  title_fr: "",
  description_ar: "",
  description_en: "",
  description_fr: "",
  icon_key: DEFAULT_ICON,
  gradient: DEFAULT_GRADIENT,
  sort_order: 0,
  is_active: true,
}

function CategoryIconPreview({
  iconKey,
  gradient,
  size = "md",
}: {
  iconKey: string
  gradient: string
  size?: "sm" | "md"
}) {
  const Icon = getCategoryIcon(iconKey)
  const box =
    size === "sm" ? "h-10 w-10 rounded-md" : "h-12 w-12 rounded-lg"
  const iconSz = size === "sm" ? "h-5 w-5" : "h-6 w-6"
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br ${gradient} ${box}`}
    >
      <Icon className={`${iconSz} text-white`} />
    </div>
  )
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCategoryRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل تحميل التصنيفات")
        return
      }
      setCategories(data.categories || [])
    } catch {
      setError("فشل تحميل التصنيفات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setError(null)
    setDialogOpen(true)
  }

  const openEdit = (row: ServiceCategoryRow) => {
    setEditing(row)
    setForm({
      slug: row.slug,
      title_ar: row.title_ar,
      title_en: row.title_en,
      title_fr: row.title_fr,
      description_ar: row.description_ar ?? "",
      description_en: row.description_en ?? "",
      description_fr: row.description_fr ?? "",
      icon_key: row.icon_key || DEFAULT_ICON,
      gradient: row.gradient || DEFAULT_GRADIENT,
      sort_order: row.sort_order,
      is_active: row.is_active,
    })
    setError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title_ar: form.title_ar.trim(),
            title_en: form.title_en.trim(),
            title_fr: form.title_fr.trim(),
            description_ar: form.description_ar.trim() || null,
            description_en: form.description_en.trim() || null,
            description_fr: form.description_fr.trim() || null,
            icon_key: form.icon_key,
            gradient: form.gradient,
            sort_order: form.sort_order,
            is_active: form.is_active,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "فشل الحفظ")
          return
        }
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? data.category : c))
        )
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            slug: form.slug.trim().toLowerCase(),
            title_ar: form.title_ar.trim(),
            title_en: form.title_en.trim(),
            title_fr: form.title_fr.trim(),
            description_ar: form.description_ar.trim() || null,
            description_en: form.description_en.trim() || null,
            description_fr: form.description_fr.trim() || null,
            icon_key: form.icon_key,
            gradient: form.gradient,
            sort_order: form.sort_order,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "فشل الإنشاء")
          return
        }
        setCategories((prev) =>
          [...prev, data.category].sort(
            (a, b) =>
              a.sort_order - b.sort_order ||
              a.title_ar.localeCompare(b.title_ar, "ar")
          )
        )
      }
      setDialogOpen(false)
    } catch {
      setError("حدث خطأ")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: ServiceCategoryRow) => {
    if (
      !confirm(
        `حذف أو إخفاء التصنيف "${row.title_ar}"؟ إن وُجدت خدمات مرتبطة سيتم إخفاؤه فقط.`
      )
    ) {
      return
    }
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل الحذف")
        return
      }
      if (data.deactivated && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === row.id ? data.category : c))
        )
        alert(data.message || "تم إخفاء التصنيف")
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== row.id))
      }
    } catch {
      setError("فشل الحذف")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">التصنيفات</h2>
        <Button
          type="button"
          onClick={openCreate}
          className="min-h-[44px] bg-purple-600 text-white hover:bg-purple-700"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة تصنيف
        </Button>
      </div>

      {error && !dialogOpen && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">قائمة التصنيفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 lg:hidden">
            {categories.map((c) => (
              <div
                key={c.id}
                className="space-y-3 rounded-lg border border-gray-700 bg-gray-700/50 p-4"
              >
                <div className="flex gap-3">
                  <CategoryIconPreview
                    iconKey={c.icon_key}
                    gradient={c.gradient}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{c.title_ar}</p>
                    <p className="text-xs text-gray-400">{c.slug}</p>
                    {c.description_ar && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-300">
                        {c.description_ar}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        className={
                          c.is_active
                            ? "bg-green-900/50 text-green-200"
                            : "bg-gray-600 text-gray-300"
                        }
                      >
                        {c.is_active ? "نشط" : "مخفي"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        ترتيب: {c.sort_order}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-[40px] flex-1 border-gray-600 bg-gray-800 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-[40px] border-red-500/50 text-red-300 hover:bg-red-900/30"
                    onClick={() => void handleDelete(c)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <AdminTableScroll tableMinWidthClassName="min-w-[800px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="w-24 text-center text-gray-300">
                      المظهر
                    </TableHead>
                    <TableHead className="text-right text-gray-300">
                      العنوان
                    </TableHead>
                    <TableHead className="text-right text-gray-300">
                      المعرف
                    </TableHead>
                    <TableHead className="text-right text-gray-300">
                      الوصف
                    </TableHead>
                    <TableHead className="text-center text-gray-300">
                      ترتيب
                    </TableHead>
                    <TableHead className="text-center text-gray-300">
                      الحالة
                    </TableHead>
                    <TableHead className="text-center text-gray-300">
                      إجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <TableCell>
                        <div className="flex justify-center">
                          <CategoryIconPreview
                            iconKey={c.icon_key}
                            gradient={c.gradient}
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {c.title_ar}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-400">
                        {c.slug}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-300">
                        {c.description_ar || "—"}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {c.sort_order}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            c.is_active
                              ? "bg-green-900/50 text-green-200"
                              : "bg-gray-600 text-gray-300"
                          }
                        >
                          {c.is_active ? "نشط" : "مخفي"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-gray-600 bg-gray-800 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500/50 text-red-300"
                            onClick={() => void handleDelete(c)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableScroll>
          </div>

          {categories.length === 0 && (
            <p className="py-8 text-center text-gray-400">لا توجد تصنيفات</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark max-h-[90vh] overflow-y-auto border-gray-700 bg-gray-800 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? "تعديل التصنيف" : "تصنيف جديد"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editing
                ? "العناوين والأوصاف بثلاث لغات، والأيقونة والألوان والترتيب. المعرف ثابت."
                : "أدخل معرفاً بالإنجليزية (مثل design) ليتوافق مع فلترة الخدمات، والنصوص بالعربية والإنجليزية والفرنسية."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-200">
                  المعرف (slug)
                </Label>
                <Input
                  id="slug"
                  dir="ltr"
                  className="border-gray-600 bg-gray-900 text-white"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="design"
                  required
                />
                <p className="text-xs text-gray-500">
                  أحرف إنجليزية صغيرة وأرقام وشرطة فقط.
                </p>
              </div>
            )}
            {editing && (
              <div className="rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2">
                <span className="text-xs text-gray-500">المعرف: </span>
                <span className="font-mono text-sm text-gray-300" dir="ltr">
                  {editing.slug}
                </span>
              </div>
            )}
            <div className="space-y-3 rounded-lg border border-gray-600 bg-gray-900/40 p-4">
              <p className="text-sm font-medium text-gray-300">العربية</p>
              <div className="space-y-2">
                <Label htmlFor="title_ar" className="text-gray-200">
                  العنوان
                </Label>
                <Input
                  id="title_ar"
                  className="border-gray-600 bg-gray-900 text-white"
                  value={form.title_ar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title_ar: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar" className="text-gray-200">
                  الوصف
                </Label>
                <Textarea
                  id="description_ar"
                  className="min-h-[72px] border-gray-600 bg-gray-900 text-white"
                  value={form.description_ar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description_ar: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-600 bg-gray-900/40 p-4">
              <p className="text-sm font-medium text-gray-300" dir="ltr">
                English
              </p>
              <div className="space-y-2">
                <Label htmlFor="title_en" className="text-gray-200" dir="ltr">
                  Title
                </Label>
                <Input
                  id="title_en"
                  dir="ltr"
                  className="border-gray-600 bg-gray-900 text-white"
                  value={form.title_en}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title_en: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description_en"
                  className="text-gray-200"
                  dir="ltr"
                >
                  Description
                </Label>
                <Textarea
                  id="description_en"
                  dir="ltr"
                  className="min-h-[72px] border-gray-600 bg-gray-900 text-white"
                  value={form.description_en}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description_en: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-600 bg-gray-900/40 p-4">
              <p className="text-sm font-medium text-gray-300">Français</p>
              <div className="space-y-2">
                <Label htmlFor="title_fr" className="text-gray-200">
                  Titre
                </Label>
                <Input
                  id="title_fr"
                  className="border-gray-600 bg-gray-900 text-white"
                  value={form.title_fr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title_fr: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_fr" className="text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="description_fr"
                  className="min-h-[72px] border-gray-600 bg-gray-900 text-white"
                  value={form.description_fr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description_fr: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-md border border-gray-600 bg-gray-900/50 p-4">
              <CategoryIconPreview
                iconKey={form.icon_key}
                gradient={form.gradient}
              />
              <p className="text-xs text-gray-400">
                معاينة كما تظهر في الصفحة الرئيسية
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">الأيقونة</Label>
              <Select
                value={form.icon_key}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, icon_key: v }))
                }
              >
                <SelectTrigger className="w-full border-gray-600 bg-gray-900 text-white">
                  <SelectValue placeholder="اختر أيقونة" />
                </SelectTrigger>
                <SelectContent className="dark max-h-64 border-gray-600 bg-gray-800 text-white">
                  {CATEGORY_ICON_OPTIONS.map((key) => {
                    const Icon = getCategoryIcon(key)
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 opacity-90" />
                          <span dir="ltr">{key}</span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">تدرج الألوان</Label>
              <Select
                value={form.gradient}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, gradient: v }))
                }
              >
                <SelectTrigger className="w-full border-gray-600 bg-gray-900 text-white">
                  <SelectValue placeholder="اختر الألوان" />
                </SelectTrigger>
                <SelectContent className="dark max-h-64 border-gray-600 bg-gray-800 text-white">
                  {CATEGORY_GRADIENT_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.classes}>
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-6 w-6 shrink-0 rounded-md bg-gradient-to-br ${p.classes}`}
                          aria-hidden
                        />
                        <span>{p.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order" className="text-gray-200">
                ترتيب العرض
              </Label>
              <Input
                id="sort_order"
                type="number"
                dir="ltr"
                className="border-gray-600 bg-gray-900 text-white"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sort_order: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
            {editing && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-gray-600 bg-gray-900/50 px-3 py-3">
                <Label htmlFor="is_active" className="text-gray-200">
                  التصنيف نشط ويظهر في القوائم
                </Label>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_active: checked }))
                  }
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 bg-gray-800 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "حفظ"
                ) : (
                  "إنشاء"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
