'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/contexts/notification-context'
import { X, Bell, Filter, Calendar } from 'lucide-react'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'today' | 'all'>('today')
  const [filteredNotifications, setFilteredNotifications] = useState(notifications)

  // Filter notifications based on selected filter
  useEffect(() => {
    if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayNotifications = notifications.filter(notification => {
        const notificationDate = new Date(notification.created_at)
        return notificationDate >= today
      })
      setFilteredNotifications(todayNotifications)
    } else {
      setFilteredNotifications(notifications)
    }
  }, [notifications, filter])

  // Update filtered notifications when notifications change
  useEffect(() => {
    if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayNotifications = notifications.filter(notification => {
        const notificationDate = new Date(notification.created_at)
        return notificationDate >= today
      })
      setFilteredNotifications(todayNotifications)
    } else {
      setFilteredNotifications(notifications)
    }
  }, [notifications, filter])

  const handleNotificationClick = (notificationId: number) => {
    if (filteredNotifications.find(n => n.id === notificationId)?.unread) {
      markAsRead(notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'payment':
        return '💳'
      case 'review':
        return '⭐'
      case 'message':
        return '💬'
      case 'system':
        return '🔔'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'payment':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'message':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">الإشعارات</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">تصفية:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('today')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'today'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                اليوم
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="ml-auto px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                تعيين الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">لا توجد إشعارات</p>
              <p className="text-sm">
                {filter === 'today' ? 'لا توجد إشعارات اليوم' : 'لا توجد إشعارات'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    notification.unread ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Unread indicator */}
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        )}
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getNotificationColor(notification.type)}`}>
                          {notification.type === 'order' && 'طلب'}
                          {notification.type === 'payment' && 'دفع'}
                          {notification.type === 'review' && 'تقييم'}
                          {notification.type === 'message' && 'رسالة'}
                          {notification.type === 'system' && 'نظام'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              عرض {filteredNotifications.length} من {notifications.length} إشعار
            </span>
            <span>
              {unreadCount} غير مقروء
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
