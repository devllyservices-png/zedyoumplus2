import { NextRequest, NextResponse } from "next/server"
import { NotificationService, NotificationTriggers } from "@/lib/notifications"
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

// POST /api/test-notification - Test notification system
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const body = await request.json()
    const { testType } = body

    console.log('=== TEST NOTIFICATION ===')
    console.log('User:', user.userId)
    console.log('Test Type:', testType)

    if (testType === 'direct') {
      // Test direct notification creation
      const success = await NotificationService.createNotification({
        user_id: user.userId,
        title_ar: 'اختبار الإشعارات',
        title_en: 'Test Notification',
        message_ar: 'هذا اختبار لنظام الإشعارات',
        message_en: 'This is a test of the notification system',
        type: 'system'
      })

      return NextResponse.json({
        success,
        message: success ? 'تم إنشاء الإشعار بنجاح' : 'فشل في إنشاء الإشعار'
      })
    }

    if (testType === 'order') {
      // Test order status change notification
      // First verify the user exists
      const { data: userExists } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.userId)
        .single()

      if (!userExists) {
        return NextResponse.json({
          success: false,
          message: 'المستخدم غير موجود في قاعدة البيانات'
        })
      }

      await NotificationTriggers.onOrderStatusChange({
        orderId: 999,
        buyerId: user.userId,
        sellerId: user.userId, // Using same user for test
        newStatus: 'pending',
        serviceTitle: 'خدمة اختبار'
      })

      return NextResponse.json({
        success: true,
        message: 'تم إرسال إشعارات الطلب بنجاح'
      })
    }

    return NextResponse.json({ error: 'نوع الاختبار غير صحيح' }, { status: 400 })

  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}

// GET /api/test-notification - Get user's notifications for testing
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const notifications = await NotificationService.getUserNotifications(user.userId)
    const unreadCount = await NotificationService.getUnreadCount(user.userId)

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })

  } catch (error) {
    console.error('Test notification GET error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
