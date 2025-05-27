import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  subscribeToNotifications: (userId: string) => () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      read: false,
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? state.unreadCount - 1
          : state.unreadCount,
      }
    })
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  subscribeToNotifications: (userId: string) => {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        get().addNotification(payload.payload as any)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
