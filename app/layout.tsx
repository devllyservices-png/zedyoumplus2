import type React from "react"
import { Cairo } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { CurrencyProvider } from "@/contexts/currency-context"
import { I18nProvider } from "@/contexts/i18n-context"
import { siteMetadata } from "@/lib/seo/site-metadata"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
})

export const metadata = siteMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="font-cairo antialiased">
        <I18nProvider>
          <AuthProvider>
            <NotificationProvider>
              <CurrencyProvider>
                {children}
                <WhatsAppFloat />
              </CurrencyProvider>
            </NotificationProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
