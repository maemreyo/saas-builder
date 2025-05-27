import { RealtimeService, BroadcastMessage } from './service'

export interface CollaborationEvent {
  type: 'cursor' | 'selection' | 'edit' | 'comment'
  userId: string
  userName?: string
  data: any
}

export class CollaborationService {
  private static channels: Map<string, any> = new Map()
  private static callbacks: Map<string, (event: CollaborationEvent) => void> = new Map()

  // Join collaboration session
  static joinSession(
    documentId: string,
    userId: string,
    userName: string,
    callback: (event: CollaborationEvent) => void
  ) {
    const channelKey = `collab-${documentId}`
    
    // Store callback
    this.callbacks.set(channelKey, callback)

    // Subscribe to broadcast
    const channel = RealtimeService.subscribeToBroadcast(
      channelKey,
      (message: BroadcastMessage) => {
        // Don't process own messages
        if (message.user_id === userId) return
        
        const event: CollaborationEvent = {
          type: message.type as any,
          userId: message.user_id,
          userName: message.payload.userName,
          data: message.payload.data,
        }
        
        callback(event)
      }
    )

    // Subscribe to presence
    RealtimeService.subscribeToPresence(
      channelKey,
      userId,
      { userName },
      {
        onJoin: (joinedUserId, metadata) => {
          if (joinedUserId !== userId) {
            callback({
              type: 'cursor',
              userId: joinedUserId,
              userName: metadata.userName,
              data: { joined: true },
            })
          }
        },
        onLeave: (leftUserId) => {
          callback({
            type: 'cursor',
            userId: leftUserId,
            data: { left: true },
          })
        },
      }
    )

    this.channels.set(channelKey, channel)
  }

  // Send collaboration event
  static async sendEvent(
    documentId: string,
    event: Omit<CollaborationEvent, 'userId'>
  ) {
    const channelKey = `collab-${documentId}`
    
    await RealtimeService.broadcast(channelKey, {
      type: event.type,
      user_id: event.userId!,
      payload: {
        userName: event.userName,
        data: event.data,
      },
    })
  }

  // Get active collaborators
  static getActiveCollaborators(documentId: string) {
    const channelKey = `collab-${documentId}`
    const channel = this.channels.get(channelKey)
    
    if (!channel) return []
    
    const presenceState = RealtimeService.getPresenceState(channel)
    return Object.entries(presenceState).map(([userId, presence]) => ({
      userId,
      ...presence[0],
    }))
  }

  // Leave session
  static async leaveSession(documentId: string) {
    const channelKey = `collab-${documentId}`
    const channel = this.channels.get(channelKey)
    
    if (channel) {
      await RealtimeService.unsubscribe(channel)
      this.channels.delete(channelKey)
      this.callbacks.delete(channelKey)
    }
  }
}