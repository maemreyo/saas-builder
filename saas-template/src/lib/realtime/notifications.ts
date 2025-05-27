import { RealtimeService } from './service'
import { NotificationStore } from '@/stores/notification-store'

export interface RealtimeNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  user_id: string
  organization_id?: string
  read: boolean
  created_at: string
}

export class RealtimeNotificationService {
  private static channels: Map<string, any> = new Map()

  // Subscribe to user notifications
  static subscribeToUserNotifications(userId: string) {
    const channelKey = `user-notifications-${userId}`
    
    // Avoid duplicate subscriptions
    if (this.channels.has(channelKey)) {
      return
    }

    const channel = RealtimeService.subscribeToTable(
      'notifications',
      (event) => {
        if (event.type === 'INSERT') {
          // Add to notification store
          NotificationStore.getState().addNotification({
            title: event.record.title,
            message: event.record.message,
            type: event.record.type,
            read: false,
          })
        }
      },
      {
        event: 'INSERT',
        filter: `user_id=eq.${userId}`,
      }
    )

    this.channels.set(channelKey, channel)
  }

  // Subscribe to organization notifications
  static subscribeToOrganizationNotifications(organizationId: string) {
    const channelKey = `org-notifications-${organizationId}`
    
    if (this.channels.has(channelKey)) {
      return
    }

    const channel = RealtimeService.subscribeToTable(
      'notifications',
      (event) => {
        if (event.type === 'INSERT') {
          NotificationStore.getState().addNotification({
            title: event.record.title,
            message: event.record.message,
            type: event.record.type,
            read: false,
          })
        }
      },
      {
        event: 'INSERT',
        filter: `organization_id=eq.${organizationId}`,
      }
    )

    this.channels.set(channelKey, channel)
  }

  // Unsubscribe from all notifications
  static async unsubscribeAll() {
    for (const [key, channel] of this.channels) {
      await RealtimeService.unsubscribe(channel)
    }
    this.channels.clear()
  }
}