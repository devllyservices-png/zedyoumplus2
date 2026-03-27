import type { LucideIcon } from "lucide-react"
import {
  Palette,
  Code,
  Languages,
  Megaphone,
  GraduationCap,
  Music,
  Camera,
  PenTool,
  Smartphone,
  Globe,
  FileText,
  Video,
  Briefcase,
  LayoutGrid,
  Package,
  Sparkles,
  Headphones,
  ShoppingBag,
  Heart,
  Zap,
} from "lucide-react"

/** Lucide icon name → component (home card + admin picker). */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Palette,
  Code,
  Languages,
  Megaphone,
  GraduationCap,
  Music,
  Camera,
  PenTool,
  Smartphone,
  Globe,
  FileText,
  Video,
  Briefcase,
  LayoutGrid,
  Package,
  Sparkles,
  Headphones,
  ShoppingBag,
  Heart,
  Zap,
}

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS).sort()

/** Tailwind `bg-gradient-to-br` color stops — same style as home category cards. */
export const CATEGORY_GRADIENT_PRESETS: { id: string; label: string; classes: string }[] = [
  { id: "pink-purple", label: "وردي → بنفسجي", classes: "from-pink-500 to-purple-600" },
  { id: "blue-cyan", label: "أزرق → سماوي", classes: "from-blue-500 to-cyan-600" },
  { id: "green-teal", label: "أخضر → فيروزي", classes: "from-green-500 to-teal-600" },
  { id: "orange-red", label: "برتقالي → أحمر", classes: "from-orange-500 to-red-600" },
  { id: "indigo-purple", label: "نيلي → بنفسجي", classes: "from-indigo-500 to-purple-600" },
  { id: "yellow-orange", label: "أصفر → برتقالي", classes: "from-yellow-500 to-orange-600" },
  { id: "gray", label: "رمادي", classes: "from-gray-500 to-gray-700" },
  { id: "rose-pink", label: "وردي غامق", classes: "from-rose-500 to-pink-600" },
  { id: "pink-rose", label: "وردي → وردي غامق", classes: "from-pink-500 to-rose-600" },
  { id: "blue-indigo", label: "أزرق → نيلي", classes: "from-blue-500 to-indigo-600" },
  { id: "cyan-blue", label: "سماوي → أزرق", classes: "from-cyan-500 to-blue-600" },
  { id: "teal-emerald", label: "فيروزي → زمردي", classes: "from-teal-500 to-emerald-600" },
  { id: "emerald-green", label: "زمردي", classes: "from-emerald-500 to-green-600" },
  { id: "violet-purple", label: "بنفسجي داكن", classes: "from-violet-500 to-purple-600" },
  { id: "amber-yellow", label: "كهرماني", classes: "from-amber-500 to-yellow-600" },
  { id: "red-pink", label: "أحمر → وردي", classes: "from-red-500 to-pink-600" },
]

const ALLOWED_GRADIENT_CLASSES = new Set(
  CATEGORY_GRADIENT_PRESETS.map((p) => p.classes)
)

export function isAllowedGradient(classes: string): boolean {
  return ALLOWED_GRADIENT_CLASSES.has(classes.trim())
}

export function isAllowedIconKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, key)
}

export function getCategoryIcon(iconKey: string | null | undefined): LucideIcon {
  if (!iconKey) return Palette
  return CATEGORY_ICONS[iconKey] ?? Palette
}
