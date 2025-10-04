'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { NotificationService, Notification, NotificationDisplay } from '@/lib/notifications'

interface NotificationContextType {
  notifications: NotificationDisplay[]
  unreadCount: number
  isLoading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refreshNotifications = async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const rawNotifications = await NotificationService.getUserNotifications(user.id)
      const formattedNotifications = rawNotifications.map(NotificationService.formatNotificationForDisplay)
      
      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => n.unread).length)
    } catch (error) {
      console.error('Error refreshing notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const success = await NotificationService.markAsRead(notificationId)
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, unread: false }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const success = await NotificationService.markAllAsRead(user.id)
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, unread: false }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Load notifications when user changes
  useEffect(() => {
    refreshNotifications()
  }, [user?.id])

  // Set up polling for new notifications every 5 seconds
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

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
