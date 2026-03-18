"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"


type Currency = {
  code: string
  name: string
  rate_to_eur: number
}

type CurrencyContextValue = {
  currency: Currency | null
  availableCurrencies: Currency[]
  setCurrencyCode: (code: string) => Promise<void>
  convertFromDzd: (amountDzd: number) => { value: number; code: string }
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/currency")
        if (!res.ok) return
        const data = await res.json()

        if (data.currency) {
          setCurrency({
            code: data.currency.code,
            name: data.currency.name,
            rate_to_eur: Number(data.currency.rate_to_eur) || 1,
          })
        }

        if (Array.isArray(data.availableCurrencies)) {
          setAvailableCurrencies(
            data.availableCurrencies.map((c: any) => ({
              code: c.code,
              name: c.name,
              rate_to_eur: Number(c.rate_to_eur) || 1,
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load currency context:", error)
      }
    }
    load()
  }, [])

  const setCurrencyCode = async (code: string) => {
    const found = availableCurrencies.find((c) => c.code === code)
    if (found) {
      setCurrency(found)

      // Persist preference for authenticated users; ignore errors
      try {
        await fetch("/api/user/currency", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: "include",
        })
      } catch {
        // no-op
      }
    }
  }

  const convertFromDzd = (amountDzd: number) => {
    if (!amountDzd || !Number.isFinite(amountDzd)) {
      return { value: 0, code: currency?.code || "DZD" }
    }

    const dzdCurrency = availableCurrencies.find((c) => c.code === "DZD")
    const rateDzdToEur = dzdCurrency?.rate_to_eur || 150 // fallback 150 DZD = 1 EUR

    const currentRateToEur = currency?.rate_to_eur || 1
    const currentCode = currency?.code || "DZD"

    const amountInEur = amountDzd / rateDzdToEur
    const converted = amountInEur * currentRateToEur

    return { value: converted, code: currentCode }
  }

  return (
    <CurrencyContext.Provider value={{ currency, availableCurrencies, setCurrencyCode, convertFromDzd }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}

