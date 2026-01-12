// Utility functions for working with notifications

import { NotificationService, NotificationTriggers } from './notifications'

// Helper function to send system notifications to all users
export async function sendSystemNotificationToAll(title: string, message: string): Promise<void> {
  try {
    // This would require getting all user IDs from the database
    // For now, this is a placeholder for future implementation
    console.log(`System notification: ${title} - ${message}`)
  } catch (error) {
    console.error('Error sending system notification to all users:', error)
  }
}

// Helper function to send system notification to specific user
export async function sendSystemNotificationToUser(
  userId: string, 
  title: string, 
  message: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(userId, title, message)
  } catch (error) {
    console.error('Error sending system notification to user:', error)
  }
}

// Helper function to send welcome notification to new users
export async function sendWelcomeNotification(userId: string): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'مرحباً بك في منصة الخدمات الرقمية',
      'نرحب بك في منصتنا! يمكنك الآن استكشاف الخدمات المتاحة أو إنشاء خدمتك الخاصة.'
    )
  } catch (error) {
    console.error('Error sending welcome notification:', error)
  }
}

// Helper function to send service approval notification
export async function sendServiceApprovalNotification(
  userId: string, 
  serviceTitle: string, 
  approved: boolean
): Promise<void> {
  try {
    const title = approved ? 'تم قبول خدمتك' : 'تم رفض خدمتك'
    const message = approved 
      ? `تم قبول خدمتك "${serviceTitle}" وهي متاحة الآن للعملاء`
      : `تم رفض خدمتك "${serviceTitle}". يرجى مراجعة الشروط والمحاولة مرة أخرى`
    
    await NotificationTriggers.onSystemNotification(userId, title, message)
  } catch (error) {
    console.error('Error sending service approval notification:', error)
  }
}

// Helper function to send account verification notification
export async function sendAccountVerificationNotification(
  userId: string, 
  verified: boolean
): Promise<void> {
  try {
    const title = verified ? 'تم التحقق من حسابك' : 'فشل التحقق من حسابك'
    const message = verified 
      ? 'تم التحقق من حسابك بنجاح! يمكنك الآن الاستفادة من جميع الميزات المتاحة'
      : 'فشل التحقق من حسابك. يرجى التأكد من صحة المعلومات المقدمة والمحاولة مرة أخرى'
    
    await NotificationTriggers.onSystemNotification(userId, title, message)
  } catch (error) {
    console.error('Error sending account verification notification:', error)
  }
}

// Helper function to send payment confirmation notification
export async function sendPaymentConfirmationNotification(
  userId: string, 
  amount: number, 
  serviceTitle: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'تم تأكيد الدفع',
      `تم تأكيد دفعتك بقيمة ${amount} دج لخدمة "${serviceTitle}" بنجاح`
    )
  } catch (error) {
    console.error('Error sending payment confirmation notification:', error)
  }
}

// Helper function to send order reminder notification
export async function sendOrderReminderNotification(
  userId: string, 
  orderId: number, 
  serviceTitle: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'تذكير بالطلب',
      `لا تنسى متابعة طلبك رقم ${orderId} لخدمة "${serviceTitle}"`
    )
  } catch (error) {
    console.error('Error sending order reminder notification:', error)
  }
}

// Helper function to send promotion notification
export async function sendPromotionNotification(
  userId: string, 
  promotionTitle: string, 
  discountPercentage: number
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'عرض خاص',
      `عرض خاص: ${promotionTitle} - خصم ${discountPercentage}% لفترة محدودة!`
    )
  } catch (error) {
    console.error('Error sending promotion notification:', error)
  }
}

// Helper function to send maintenance notification
export async function sendMaintenanceNotification(
  userId: string, 
  maintenanceDate: string, 
  duration: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'إشعار صيانة',
      `سيتم إجراء صيانة على المنصة في ${maintenanceDate} لمدة ${duration}. نعتذر عن الإزعاج`
    )
  } catch (error) {
    console.error('Error sending maintenance notification:', error)
  }
}

// Helper function to send security alert notification
export async function sendSecurityAlertNotification(
  userId: string, 
  alertType: string
): Promise<void> {
  try {
    const title = 'تنبيه أمني'
    const message = `تم اكتشاف نشاط غير عادي على حسابك: ${alertType}. يرجى مراجعة حسابك`
    
    await NotificationTriggers.onSystemNotification(userId, title, message)
  } catch (error) {
    console.error('Error sending security alert notification:', error)
  }
}

// Helper function to send feature update notification
export async function sendFeatureUpdateNotification(
  userId: string, 
  featureName: string, 
  description: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'ميزة جديدة',
      `تم إضافة ميزة جديدة: ${featureName}. ${description}`
    )
  } catch (error) {
    console.error('Error sending feature update notification:', error)
  }
}

// Helper function to send feedback request notification
export async function sendFeedbackRequestNotification(
  userId: string, 
  serviceTitle: string
): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'طلب تقييم',
      `يرجى تقييم خدمتك "${serviceTitle}" لمساعدتنا في تحسين جودة الخدمات`
    )
  } catch (error) {
    console.error('Error sending feedback request notification:', error)
  }
}

// Helper function to send account suspension notification
export async function sendAccountSuspensionNotification(
  userId: string, 
  reason: string, 
  duration?: string
): Promise<void> {
  try {
    const title = 'تعليق الحساب'
    const message = duration 
      ? `تم تعليق حسابك لمدة ${duration} بسبب: ${reason}`
      : `تم تعليق حسابك بسبب: ${reason}`
    
    await NotificationTriggers.onSystemNotification(userId, title, message)
  } catch (error) {
    console.error('Error sending account suspension notification:', error)
  }
}

// Helper function to send account reactivation notification
export async function sendAccountReactivationNotification(userId: string): Promise<void> {
  try {
    await NotificationTriggers.onSystemNotification(
      userId,
      'تم إعادة تفعيل حسابك',
      'تم إعادة تفعيل حسابك بنجاح! يمكنك الآن استخدام جميع الميزات المتاحة'
    )
  } catch (error) {
    console.error('Error sending account reactivation notification:', error)
  }
}
