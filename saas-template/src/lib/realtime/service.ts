import { createClient } from '@/lib/supabase/server'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
  timestamp: string
}

export interface BroadcastMessage {
  type: string
  payload: any
  user_id: string
  timestamp: string
}

export class RealtimeService {
  // Subscribe to database changes
  static subscribeToTable(
    table: string,
    callback: (event: RealtimeEvent) => void,
    options?: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      filter?: string
      schema?: string
    }
  ): RealtimeChannel {
    const supabase = createClient()
    
    const channel = supabase
      .channel(`db-${table}`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table,
          filter: options?.filter,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const event: RealtimeEvent = {
            type: payload.eventType as any,
            table: payload.table,
            record: payload.new || payload.old,
            old_record: payload.old,
            timestamp: new Date().toISOString(),
          }
          callback(event)
        }
      )
      .subscribe()

    return channel
  }

  // Subscribe to presence (who's online)
  static subscribeToPresence(
    channelName: string,
    userId: string,
    userMetadata: any,
    callbacks: {
      onSync?: () => void
      onJoin?: (userId: string, metadata: any) => void
      onLeave?: (userId: string) => void
    }
  ): RealtimeChannel {
    const supabase = createClient()
    
    const channel = supabase.channel(channelName)

    // Track user presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      callbacks.onSync?.()
    })

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      callbacks.onJoin?.(key, newPresences[0])
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      callbacks.onLeave?.(key)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...userMetadata,
        })
      }
    })

    return channel
  }

  // Subscribe to broadcast messages
  static subscribeToBroadcast(
    channelName: string,
    callback: (message: BroadcastMessage) => void
  ): RealtimeChannel {
    const supabase = createClient()
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, (payload) => {
        callback(payload.payload as BroadcastMessage)
      })
      .subscribe()

    return channel
  }

  // Send broadcast message
  static async broadcast(
    channelName: string,
    message: Omit<BroadcastMessage, 'timestamp'>
  ) {
    const supabase = createClient()
    
    const channel = supabase.channel(channelName)
    
    await channel.send({
      type: 'broadcast',
      event: message.type,
      payload: {
        ...message,
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Unsubscribe from channel
  static async unsubscribe(channel: RealtimeChannel) {
    const supabase = createClient()
    await supabase.removeChannel(channel)
  }

  // Get presence state
  static getPresenceState(channel: RealtimeChannel) {
    return channel.presenceState()
  }
}