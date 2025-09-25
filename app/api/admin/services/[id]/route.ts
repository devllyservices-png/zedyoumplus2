import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production"

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const serviceId = params.id

    // Delete the service
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)

    if (deleteError) {
      console.error('Error deleting service:', deleteError)
      return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully" })

  } catch (error) {
    console.error('Error in delete service API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

