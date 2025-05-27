-- Create organization invites table
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role org_role NOT NULL DEFAULT 'MEMBER',
  token UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_organization_invites_token ON organization_invites(token);
CREATE INDEX idx_organization_invites_organization_id ON organization_invites(organization_id);
CREATE INDEX idx_organization_invites_email ON organization_invites(email);
CREATE INDEX idx_organization_invites_expires_at ON organization_invites(expires_at);

-- Create composite index for member lookup
CREATE INDEX idx_organization_members_org_user ON organization_members(organization_id, user_id);

-- Add RLS policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they're members of
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Only admins and owners can update organizations
CREATE POLICY "Admins can update organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Only owners can delete organizations
CREATE POLICY "Owners can delete organizations" ON organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'OWNER'
    )
  );

-- Add RLS policies for organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Members can view all members of their organizations
CREATE POLICY "Members can view organization members" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Only admins and owners can add members
CREATE POLICY "Admins can add members" ON organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('ADMIN', 'OWNER')
    )
  );

-- Only admins and owners can update members (or users can update themselves)
CREATE POLICY "Admins can update members" ON organization_members
  FOR UPDATE USING (
    organization_members.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('ADMIN', 'OWNER')
    )
  );

-- Only admins and owners can remove members (or users can remove themselves)
CREATE POLICY "Admins can remove members" ON organization_members
  FOR DELETE USING (
    organization_members.user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('ADMIN', 'OWNER')
    )
  );

-- Add RLS policies for organization_invites
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Admins can view invites for their organizations
CREATE POLICY "Admins can view invites" ON organization_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_invites.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Admins can create invites
CREATE POLICY "Admins can create invites" ON organization_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_invites.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Admins can delete invites
CREATE POLICY "Admins can delete invites" ON organization_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_invites.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Function to clean up expired invites
CREATE OR REPLACE FUNCTION clean_expired_invites()
RETURNS void AS $$
BEGIN
  DELETE FROM organization_invites
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to ensure at least one owner exists
CREATE OR REPLACE FUNCTION ensure_organization_has_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this would remove the last owner
  IF OLD.role = 'OWNER' AND (NEW.role IS NULL OR NEW.role != 'OWNER') THEN
    IF NOT EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = OLD.organization_id
      AND role = 'OWNER'
      AND id != OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot remove the last owner of an organization';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure at least one owner
CREATE TRIGGER ensure_owner_before_update
  BEFORE UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION ensure_organization_has_owner();