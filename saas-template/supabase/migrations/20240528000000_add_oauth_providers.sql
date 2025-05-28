-- Add auth_providers field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_providers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP WITH TIME ZONE;

-- Create oauth_accounts table for managing linked accounts
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_data JSONB,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_user_id),
  UNIQUE(user_id, provider)
);

-- Create indexes
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);

-- Add RLS policies
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own OAuth accounts
CREATE POLICY "Users can view own OAuth accounts" ON oauth_accounts
  FOR SELECT USING (user_id = auth.uid());

-- Users can link OAuth accounts
CREATE POLICY "Users can link OAuth accounts" ON oauth_accounts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can unlink OAuth accounts
CREATE POLICY "Users can unlink OAuth accounts" ON oauth_accounts
  FOR DELETE USING (user_id = auth.uid());

-- Function to handle OAuth login/signup
CREATE OR REPLACE FUNCTION handle_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If user doesn't exist in users table, create them
  INSERT INTO users (id, email, email_verified)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO UPDATE
  SET email_verified = COALESCE(users.email_verified, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync auth.users with public.users
CREATE TRIGGER on_auth_user_created_oauth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' IS NOT NULL)
  EXECUTE FUNCTION handle_oauth_user();