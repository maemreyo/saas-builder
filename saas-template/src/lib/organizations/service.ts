import { createClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/email/service'
import { z } from 'zod'

// Validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
})

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  user_id: string
  organization_id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joined_at: string
  user?: {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }
}

export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  token: string
  expires_at: string
  created_at: string
  created_by: string
}

export class OrganizationService {
  // Create a new organization
  static async createOrganization(data: z.infer<typeof createOrganizationSchema>, userId: string) {
    const supabase = createClient()
    
    // Check if slug is unique
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', data.slug)
      .single()

    if (existing) {
      throw new Error('An organization with this slug already exists')
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert(data)
      .select()
      .single()

    if (orgError) {
      throw new Error(orgError.message)
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: 'OWNER',
      })

    if (memberError) {
      // Rollback organization creation
      await supabase.from('organizations').delete().eq('id', org.id)
      throw new Error(memberError.message)
    }

    return org
  }

  // Get user's organizations
  static async getUserOrganizations(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        joined_at,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Get organization by ID or slug
  static async getOrganization(idOrSlug: string) {
    const supabase = createClient()
    
    // Check if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    const query = supabase
      .from('organizations')
      .select('*')
      .single()

    const { data, error } = isUuid
      ? await query.eq('id', idOrSlug)
      : await query.eq('slug', idOrSlug)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Update organization
  static async updateOrganization(
    organizationId: string,
    data: z.infer<typeof updateOrganizationSchema>
  ) {
    const supabase = createClient()
    
    // If updating slug, check uniqueness
    if (data.slug) {
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', organizationId)
        .single()

      if (existing) {
        throw new Error('An organization with this slug already exists')
      }
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return org
  }

  // Delete organization
  static async deleteOrganization(organizationId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Get organization members
  static async getMembers(organizationId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:users(id, email, name, avatar_url)
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Invite member
  static async inviteMember(
    organizationId: string,
    data: z.infer<typeof inviteMemberSchema>,
    invitedBy: string
  ) {
    const supabase = createClient()
    
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', (
        await supabase
          .from('users')
          .select('id')
          .eq('email', data.email)
          .single()
      ).data?.id)
      .single()

    if (existingMember) {
      throw new Error('User is already a member of this organization')
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from('organization_invites')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', data.email)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      throw new Error('An invite has already been sent to this email')
    }

    // Create invite
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const { data: invite, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: organizationId,
        email: data.email,
        role: data.role,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: invitedBy,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Get organization details for email
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    // Get inviter details
    const { data: inviter } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', invitedBy)
      .single()

    // Send invitation email
    await EmailService.sendTeamInvitationEmail({
      to: data.email,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/invites/${token}`,
      inviterName: inviter?.name || inviter?.email || 'A team member',
      teamName: org?.name || 'the team',
    })

    return invite
  }

  // Accept invite
  static async acceptInvite(token: string, userId: string) {
    const supabase = createClient()
    
    // Get invite
    const { data: invite, error: inviteError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invite) {
      throw new Error('Invalid or expired invitation')
    }

    // Check if user email matches invite email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (user?.email !== invite.email) {
      throw new Error('This invitation was sent to a different email address')
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: invite.organization_id,
        role: invite.role,
      })

    if (memberError) {
      throw new Error(memberError.message)
    }

    // Delete invite
    await supabase
      .from('organization_invites')
      .delete()
      .eq('id', invite.id)

    return { success: true, organizationId: invite.organization_id }
  }

  // Update member role
  static async updateMemberRole(
    organizationId: string,
    userId: string,
    newRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  ) {
    const supabase = createClient()
    
    // Can't change the last owner's role
    if (newRole !== 'OWNER') {
      const { data: owners } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('role', 'OWNER')

      if (owners?.length === 1 && owners[0].id === userId) {
        throw new Error('Cannot change role of the last owner')
      }
    }

    const { error } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Remove member
  static async removeMember(organizationId: string, userId: string) {
    const supabase = createClient()
    
    // Can't remove the last owner
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single()

    if (member?.role === 'OWNER') {
      const { data: owners } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('role', 'OWNER')

      if (owners?.length === 1) {
        throw new Error('Cannot remove the last owner')
      }
    }

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Check user's role in organization
  static async getUserRole(organizationId: string, userId: string): Promise<'OWNER' | 'ADMIN' | 'MEMBER' | null> {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single()

    return data?.role || null
  }

  // Check if user can perform action
  static async canUserPerformAction(
    organizationId: string,
    userId: string,
    action: 'manage_members' | 'manage_billing' | 'delete_organization'
  ): Promise<boolean> {
    const role = await this.getUserRole(organizationId, userId)
    
    if (!role) return false

    switch (action) {
      case 'manage_members':
        return ['OWNER', 'ADMIN'].includes(role)
      case 'manage_billing':
        return role === 'OWNER'
      case 'delete_organization':
        return role === 'OWNER'
      default:
        return false
    }
  }

  // Get pending invites
  static async getPendingInvites(organizationId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_invites')
      .select(`
        *,
        inviter:users!organization_invites_created_by_fkey(name, email)
      `)
      .eq('organization_id', organizationId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Cancel invite
  static async cancelInvite(inviteId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('organization_invites')
      .delete()
      .eq('id', inviteId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }
}