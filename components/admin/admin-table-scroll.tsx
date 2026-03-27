"use client"

import { cn } from "@/lib/utils"

/** Horizontal + vertical scroll for wide admin tables; sticky thead is applied on `TableHeader` in each view. */
export function AdminTableScroll({
  children,
  className,
  tableMinWidthClassName = "min-w-[920px]",
}: {
  children: React.ReactNode
  className?: string
  /** Use `min-w-[640px]` for narrower tables (e.g. currencies). */
  tableMinWidthClassName?: string
}) {
  return (
    <div
      className={cn(
        "relative max-h-[min(70vh,720px)] w-full overflow-auto rounded-lg border border-gray-700/80 [-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      <div className={tableMinWidthClassName}>{children}</div>
    </div>
  )
}
