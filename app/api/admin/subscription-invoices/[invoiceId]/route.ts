import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { userId: decoded.userId as string, email: decoded.email as string, role: decoded.role as string }
  } catch {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { invoiceId } = await params
    const body = (await request.json()) as { action?: "approve" | "reject" }
    const action = body?.action

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 })
    }

    if (action === "approve") {
      const { data, error } = await supabase.rpc("approve_subscription_invoice", {
        p_invoice_id: invoiceId,
      })

      if (error) {
        console.error("approve_subscription_invoice rpc error:", error)
        return NextResponse.json({ error: "فشل في الموافقة" }, { status: 500 })
      }

      const result = Array.isArray(data) ? data[0] : data
      return NextResponse.json({ success: true, result })
    }

    const { error } = await supabase.rpc("reject_subscription_invoice", {
      p_invoice_id: invoiceId,
    })

    if (error) {
      console.error("reject_subscription_invoice rpc error:", error)
      return NextResponse.json({ error: "فشل في الرفض" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin subscription invoice PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

