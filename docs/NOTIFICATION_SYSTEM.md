# Notification System Documentation

## Overview

The notification system is a modular, polling-based notification system built for the Algerian E-commerce Platform. It provides automatic notifications for various events like new orders, payments, reviews, and system updates. The system fetches notifications from the database every 5 seconds to keep users updated.

## Features

- ✅ Polling-based notifications (fetches every 5 seconds)
- ✅ Bilingual support (Arabic/English)
- ✅ Multiple notification types (order, payment, review, message, system)
- ✅ Mark as read functionality
- ✅ Unread count tracking
- ✅ Modular trigger system for easy extension
- ✅ Automatic notifications for key events
- ✅ Responsive UI components
- ✅ Optimized polling (only when page is visible)

## Database Schema

The notification system uses the following Supabase table structure:

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_ar VARCHAR(200) NOT NULL,
    title_en VARCHAR(200),
    message_ar TEXT NOT NULL,
    message_en TEXT,
    type VARCHAR(50) NOT NULL, -- 'order', 'message', 'review', 'system', 'payment'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## File Structure

```
lib/
├── notifications.ts          # Core notification service and triggers
├── notification-utils.ts     # Utility functions for common notifications
└── supabaseClient.ts        # Supabase client configuration

contexts/
└── notification-context.tsx  # React context for global state management

components/
├── header.tsx               # Updated with real notifications
└── home-header.tsx          # Updated with real notifications

app/
├── layout.tsx               # Updated with NotificationProvider
└── api/                     # API routes with notification triggers
    ├── orders/
    ├── order-payments/
    └── services/[id]/reviews/
```

## Core Components

### 1. NotificationService

The main service class that handles all notification operations:

```typescript
// Get notifications for a user
const notifications = await NotificationService.getUserNotifications(userId)

// Mark notification as read
await NotificationService.markAsRead(notificationId)

// Mark all notifications as read
await NotificationService.markAllAsRead(userId)

// Get unread count
const unreadCount = await NotificationService.getUnreadCount(userId)

// Create a new notification
await NotificationService.createNotification({
  user_id: userId,
  title_ar: 'عنوان الإشعار',
  message_ar: 'رسالة الإشعار',
  type: 'order'
})
```

### 2. NotificationTriggers

Automatic notification triggers for various events:

```typescript
// New order notification
await NotificationTriggers.onNewOrder({
  orderId: 123,
  buyerId: 'user-uuid',
  sellerId: 'seller-uuid',
  serviceTitle: 'خدمة التصميم'
})

// Order status change notification
await NotificationTriggers.onOrderStatusChange({
  orderId: 123,
  buyerId: 'user-uuid',
  sellerId: 'seller-uuid',
  newStatus: 'completed',
  serviceTitle: 'خدمة التصميم'
})

// Payment received notification
await NotificationTriggers.onPaymentReceived({
  orderId: 123,
  buyerId: 'user-uuid',
  sellerId: 'seller-uuid',
  amount: 5000,
  serviceTitle: 'خدمة التصميم'
})

// Review received notification
await NotificationTriggers.onReviewReceived({
  reviewId: 456,
  reviewerId: 'user-uuid',
  sellerId: 'seller-uuid',
  rating: 5,
  serviceTitle: 'خدمة التصميم'
})
```

### 3. NotificationContext

React context for global notification state management:

```typescript
import { useNotifications } from '@/contexts/notification-context'

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          {notification.title}
        </div>
      ))}
    </div>
  )
}
```

## Notification Types

### 1. Order Notifications
- **New Order**: Sent to seller when a new order is created
- **Order Confirmation**: Sent to buyer when order is confirmed
- **Status Updates**: Sent to buyer when order status changes (in_progress, completed, cancelled)

### 2. Payment Notifications
- **Payment Received**: Sent to seller when payment is made
- **Payment Confirmed**: Sent to buyer when payment is confirmed

### 3. Review Notifications
- **New Review**: Sent to seller when a new review is received

### 4. System Notifications
- **Welcome**: Sent to new users
- **Service Approval**: Sent when service is approved/rejected
- **Account Verification**: Sent when account is verified
- **Maintenance**: Sent for scheduled maintenance
- **Security Alerts**: Sent for security-related events
- **Feature Updates**: Sent when new features are added

## Usage Examples

### Adding Notifications to New API Endpoints

```typescript
import { NotificationTriggers } from '@/lib/notifications'

// In your API route
export async function POST(request: NextRequest) {
  // ... your existing logic ...
  
  // After successful operation, trigger notification
  try {
    await NotificationTriggers.onNewOrder({
      orderId: newOrder.id,
      buyerId: newOrder.buyer_id,
      sellerId: newOrder.seller_id,
      serviceTitle: service.title
    })
  } catch (notificationError) {
    console.error('Error sending notification:', notificationError)
    // Don't fail the main operation if notifications fail
  }
  
  return NextResponse.json({ success: true })
}
```

### Using Utility Functions

```typescript
import { sendWelcomeNotification, sendServiceApprovalNotification } from '@/lib/notification-utils'

// Send welcome notification to new user
await sendWelcomeNotification(userId)

// Send service approval notification
await sendServiceApprovalNotification(userId, 'خدمة التصميم', true)
```

### Custom Notification Types

To add new notification types:

1. Update the `type` field in the database schema
2. Add the new type to the TypeScript interfaces
3. Create a new trigger function in `NotificationTriggers`
4. Update the UI components to handle the new type

```typescript
// Add new trigger function
static async onCustomEvent(eventData: {
  userId: string
  customData: any
}): Promise<void> {
  await NotificationService.createNotification({
    user_id: eventData.userId,
    title_ar: 'عنوان مخصص',
    title_en: 'Custom Title',
    message_ar: 'رسالة مخصصة',
    message_en: 'Custom Message',
    type: 'custom'
  })
}
```

## Polling Updates

The notification system uses a polling mechanism to automatically fetch new notifications every 5 seconds:

```typescript
// In NotificationContext
useEffect(() => {
  if (!user?.id) return

  const interval = setInterval(() => {
    // Only poll if the page is visible (user is active)
    if (!document.hidden) {
      refreshNotifications()
    }
  }, 5000) // Poll every 5 seconds

  return () => {
    clearInterval(interval)
  }
}, [user?.id])
```

### Polling Optimization

- **Page Visibility**: Only polls when the page is visible (user is active)
- **User-specific**: Only polls when a user is logged in
- **Automatic Cleanup**: Clears intervals when component unmounts
- **Efficient**: Uses the same API endpoint as manual refresh

## Performance Considerations

1. **Indexing**: Proper database indexes are created for efficient queries
2. **Pagination**: Notifications are limited to 50 most recent items
3. **Polling Optimization**: Only polls when page is visible and user is logged in
4. **Error Handling**: Notification failures don't affect main operations
5. **Caching**: Local state management reduces database calls
6. **Efficient Polling**: 5-second intervals are reasonable for most use cases

## Security

1. **User Isolation**: Users can only see their own notifications
2. **Input Validation**: All notification data is validated
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **Rate Limiting**: Consider implementing rate limiting for notification creation

## Testing

To test the notification system:

1. Create a new order and verify notifications are sent
2. Update order status and check for status change notifications
3. Make a payment and verify payment notifications
4. Add a review and check for review notifications
5. Test mark as read functionality
6. Verify polling updates work correctly (wait 5+ seconds for new notifications)

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check if NotificationProvider is properly wrapped around the app
2. **Polling not working**: Verify user is authenticated and page is visible
3. **Database errors**: Check if the notifications table exists and has proper permissions
4. **Type errors**: Ensure all TypeScript interfaces are properly imported
5. **Performance issues**: Consider adjusting polling interval if needed

### Debug Mode

Enable debug logging by adding console.log statements in the notification service:

```typescript
// In NotificationService.createNotification
console.log('Creating notification:', notification)
```

## Future Enhancements

1. **Email Notifications**: Add email notifications for important events
2. **Push Notifications**: Implement browser push notifications
3. **Notification Preferences**: Allow users to customize notification settings
4. **Notification Templates**: Create reusable notification templates
5. **Analytics**: Track notification engagement and effectiveness
6. **Bulk Notifications**: Send notifications to multiple users at once
7. **Scheduled Notifications**: Support for delayed/scheduled notifications
8. **Notification Categories**: Group notifications by category for better organization

## Contributing

When adding new notification features:

1. Follow the existing patterns and naming conventions
2. Add proper TypeScript types
3. Include error handling
4. Update this documentation
5. Test thoroughly
6. Consider performance implications

## Support

For issues or questions about the notification system, please refer to the main project documentation or contact the development team.
