-- Create email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Add RLS policies
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Only the user can view their own verification tokens
CREATE POLICY "Users can view own verification tokens" ON email_verifications
  FOR SELECT USING (user_id = auth.uid());

-- Service role can manage all verification tokens
CREATE POLICY "Service role can manage verification tokens" ON email_verifications
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired verifications
CREATE OR REPLACE FUNCTION clean_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add activity_logs table if not exists
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);

-- Add RLS for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Organization members can view org activity
CREATE POLICY "Organization members can view org activity" ON activity_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );