"use client"

import { useCurrency } from "@/contexts/currency-context"

type PriceProps = {
  amountDzd: number
  className?: string
}

export function Price({ amountDzd, className }: PriceProps) {
  const { convertFromDzd } = useCurrency()

  const amount = Number(amountDzd) || 0
  const { value, code } = convertFromDzd(amount)

  const displayValue = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

  return (
    <span className={className}>
      {displayValue} {code === "DZD" ? "دج" : code}
    </span>
  )
}

