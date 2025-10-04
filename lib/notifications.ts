import { supabase } from './supabaseClient'

export interface Notification {
  id: number
  user_id: string // UUID format
  title_ar: string
  title_en?: string
  message_ar: string
  message_en?: string
  type: 'order' | 'message' | 'review' | 'system' | 'payment'
  is_read: boolean
  created_at: string
}

export interface NotificationDisplay {
  id: number
  title: string
  message: string
  time: string
  type: 'order' | 'message' | 'review' | 'system' | 'payment'
  unread: boolean
  created_at: string
}

export class NotificationService {
  // Get notifications for a user
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  }

  // Mark notification as read
  static async markAsRead(notificationId: number): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  }

  // Get unread count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<boolean> {
    console.log('Creating notification:', notification)
    
    // First, verify the user exists
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', notification.user_id)
      .single()

    if (userCheckError || !userExists) {
      console.error('User does not exist for notification:', {
        userId: notification.user_id,
        error: userCheckError
      })
      return false
    }
    
    const { error } = await supabase
      .from('notifications')
      .insert([notification])

    if (error) {
      console.error('Error creating notification:', error)
      return false
    }

    console.log('Notification created successfully')
    return true
  }

  // Format notification for display
  static formatNotificationForDisplay(notification: Notification): NotificationDisplay {
    const now = new Date()
    const createdAt = new Date(notification.created_at)
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))

    let timeString = ''
    if (diffInMinutes < 1) {
      timeString = 'الآن'
    } else if (diffInMinutes < 60) {
      timeString = `منذ ${diffInMinutes} دقيقة`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      timeString = `منذ ${hours} ساعة`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      timeString = `منذ ${days} يوم`
    }

    return {
      id: notification.id,
      title: notification.title_ar,
      message: notification.message_ar,
      time: timeString,
      type: notification.type,
      unread: !notification.is_read,
      created_at: notification.created_at
    }
  }
}

// Notification triggers for different events
export class NotificationTriggers {
  // Trigger when a new order is created
  static async onNewOrder(orderData: {
    orderId: number
    buyerId: string
    sellerId: string
    serviceTitle: string
  }): Promise<void> {
    // Notify seller about new order
    await NotificationService.createNotification({
      user_id: orderData.sellerId,
      title_ar: 'طلب جديد',
      title_en: 'New Order',
      message_ar: `لديك طلب جديد لخدمة: ${orderData.serviceTitle}`,
      message_en: `You have a new order for service: ${orderData.serviceTitle}`,
      type: 'order'
    })

    // Notify buyer about order confirmation
    await NotificationService.createNotification({
      user_id: orderData.buyerId,
      title_ar: 'تم تأكيد الطلب',
      title_en: 'Order Confirmed',
      message_ar: `تم تأكيد طلبك بنجاح`,
      message_en: 'Your order has been confirmed successfully',
      type: 'order'
    })
  }

  // Trigger when order status changes
  static async onOrderStatusChange(orderData: {
    orderId: number
    buyerId: string
    sellerId: string
    newStatus: string
    serviceTitle: string
  }): Promise<void> {
    console.log('=== NOTIFICATION TRIGGER: ORDER STATUS CHANGE ===')
    console.log('Order Data:', orderData)
    
    const statusMessages = {
      'pending': {
        buyer: {
          ar: 'تم تأكيد طلبك من قبل الإدارة',
          en: 'Your order has been confirmed by admin'
        },
        seller: {
          ar: 'لديك طلب جديد مؤكد من الإدارة',
          en: 'You have a new confirmed order from admin'
        }
      },
      'in_progress': {
        buyer: {
          ar: 'تم بدء العمل على طلبك',
          en: 'Work has started on your order'
        },
        seller: {
          ar: 'تم تأكيد بدء العمل على طلبك',
          en: 'Work start has been confirmed for your order'
        }
      },
      'completed': {
        buyer: {
          ar: 'تم إنجاز طلبك بنجاح',
          en: 'Your order has been completed successfully'
        },
        seller: {
          ar: 'تم تأكيد إنجاز طلبك',
          en: 'Your order completion has been confirmed'
        }
      },
      'cancelled': {
        buyer: {
          ar: 'تم إلغاء طلبك',
          en: 'Your order has been cancelled'
        },
        seller: {
          ar: 'تم إلغاء طلبك',
          en: 'Your order has been cancelled'
        }
      }
    }

    const message = statusMessages[orderData.newStatus as keyof typeof statusMessages]
    
    if (message) {
      // Notify buyer
      console.log('Sending notification to buyer:', orderData.buyerId)
      await NotificationService.createNotification({
        user_id: orderData.buyerId,
        title_ar: 'تحديث حالة الطلب',
        title_en: 'Order Status Update',
        message_ar: `${message.buyer.ar} - ${orderData.serviceTitle}`,
        message_en: `${message.buyer.en} - ${orderData.serviceTitle}`,
        type: 'order'
      })

      // Notify seller
      console.log('Sending notification to seller:', orderData.sellerId)
      await NotificationService.createNotification({
        user_id: orderData.sellerId,
        title_ar: 'تحديث حالة الطلب',
        title_en: 'Order Status Update',
        message_ar: `${message.seller.ar} - ${orderData.serviceTitle}`,
        message_en: `${message.seller.en} - ${orderData.serviceTitle}`,
        type: 'order'
      })
      
      console.log('Both notifications sent successfully')
    } else {
      console.log('No message found for status:', orderData.newStatus)
    }
  }

  // Trigger when payment is made
  static async onPaymentReceived(paymentData: {
    orderId: number
    buyerId: string
    sellerId: string
    amount: number
    serviceTitle: string
  }): Promise<void> {
    // Notify seller about payment received
    await NotificationService.createNotification({
      user_id: paymentData.sellerId,
      title_ar: 'تم استلام الدفع',
      title_en: 'Payment Received',
      message_ar: `تم استلام دفعة بقيمة ${paymentData.amount} دج لخدمة: ${paymentData.serviceTitle}`,
      message_en: `Payment of ${paymentData.amount} DZD received for service: ${paymentData.serviceTitle}`,
      type: 'payment'
    })

    // Notify buyer about successful payment
    await NotificationService.createNotification({
      user_id: paymentData.buyerId,
      title_ar: 'تم تأكيد الدفع',
      title_en: 'Payment Confirmed',
      message_ar: `تم تأكيد دفعتك بنجاح لخدمة: ${paymentData.serviceTitle}`,
      message_en: `Your payment has been confirmed for service: ${paymentData.serviceTitle}`,
      type: 'payment'
    })
  }

  // Trigger when a review is received
  static async onReviewReceived(reviewData: {
    reviewId: number
    reviewerId: string
    sellerId: string
    rating: number
    serviceTitle: string
  }): Promise<void> {
    await NotificationService.createNotification({
      user_id: reviewData.sellerId,
      title_ar: 'تقييم جديد',
      title_en: 'New Review',
      message_ar: `حصلت على تقييم ${reviewData.rating} نجوم لخدمة: ${reviewData.serviceTitle}`,
      message_en: `You received a ${reviewData.rating}-star review for service: ${reviewData.serviceTitle}`,
      type: 'review'
    })
  }

  // Trigger when a message is received
  static async onMessageReceived(messageData: {
    messageId: number
    senderId: string
    receiverId: string
    orderId: number
    serviceTitle: string
  }): Promise<void> {
    await NotificationService.createNotification({
      user_id: messageData.receiverId,
      title_ar: 'رسالة جديدة',
      title_en: 'New Message',
      message_ar: `رسالة جديدة حول طلب: ${messageData.serviceTitle}`,
      message_en: `New message regarding order: ${messageData.serviceTitle}`,
      type: 'message'
    })
  }

  // Trigger system notifications
  static async onSystemNotification(userId: string, title: string, message: string): Promise<void> {
    await NotificationService.createNotification({
      user_id: userId,
      title_ar: title,
      title_en: title,
      message_ar: message,
      message_en: message,
      type: 'system'
    })
  }
}
