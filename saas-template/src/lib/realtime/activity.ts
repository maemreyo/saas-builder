import { RealtimeService } from './service'

export interface ActivityEvent {
  id: string
  type: string
  action: string
  resource_type: string
  resource_id: string
  resource_name?: string
  user_id: string
  user_name?: string
  organization_id?: string
  metadata?: any
  created_at: string
}

export class ActivityService {
  // Log activity
  static async logActivity(activity: Omit<ActivityEvent, 'id' | 'created_at'>) {
    const supabase = createClient()
    
    await supabase.from('activity_logs').insert({
      ...activity,
      created_at: new Date().toISOString(),
    })
  }

  // Subscribe to organization activity
  static subscribeToOrganizationActivity(
    organizationId: string,
    callback: (activity: ActivityEvent) => void
  ) {
    return RealtimeService.subscribeToTable(
      'activity_logs',
      (event) => {
        if (event.type === 'INSERT') {
          callback(event.record as ActivityEvent)
        }
      },
      {
        event: 'INSERT',
        filter: `organization_id=eq.${organizationId}`,
      }
    )
  }

  // Get recent activity
  static async getRecentActivity(options: {
    organizationId?: string
    userId?: string
    limit?: number
  }) {
    const supabase = createClient()
    
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)

    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId)
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}