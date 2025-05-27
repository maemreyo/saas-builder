import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  event?: string
  schema?: string
  table?: string
  filter?: string
}

export function useRealtime<T = any>(
  channel: string,
  options: UseRealtimeOptions = {},
  callback: (payload: T) => void
) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let realtimeChannel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        realtimeChannel = supabase.channel(channel)

        if (options.table) {
          realtimeChannel = realtimeChannel.on(
            'postgres_changes' as any,
            {
              event: options.event || '*',
              schema: options.schema || 'public',
              table: options.table,
              filter: options.filter,
            },
            (payload) => {
              callback(payload as T)
            }
          )
        } else {
          realtimeChannel = realtimeChannel.on(
            'broadcast',
            { event: options.event || '*' },
            (payload) => {
              callback(payload as T)
            }
          )
        }

        await realtimeChannel.subscribe((status) => {
          setIsSubscribed(status === 'SUBSCRIBED')
        })
      } catch (err) {
        setError(err as Error)
      }
    }

    setupSubscription()

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [channel, options.event, options.schema, options.table, options.filter])

  return { isSubscribed, error }
}
