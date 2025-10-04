import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { NotificationProvider } from "@/contexts/notification-context"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "منصة الخدمات الجزائرية",
  description: "منصتك الشاملة لطلب الخدمات الرقمية وشراء المنتجات المضمونة",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
