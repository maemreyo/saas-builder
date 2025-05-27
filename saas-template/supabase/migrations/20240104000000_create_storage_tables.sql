-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  url TEXT,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file shares table
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  token UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  password_hash TEXT,
  access_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_organization_id ON folders(organization_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_organization_id ON files(organization_id);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_tags ON files USING GIN(tags);

CREATE INDEX idx_file_shares_token ON file_shares(token);
CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX idx_file_shares_expires_at ON file_shares(expires_at);

-- Create updated_at triggers
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Users can view their own folders
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = folders.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can create folders
CREATE POLICY "Users can create folders" ON folders
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = folders.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can update their own folders
CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = folders.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can delete their own folders
CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = folders.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Add RLS policies for files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can view their own files or public files
CREATE POLICY "Users can view files" ON files
  FOR SELECT USING (
    is_public = true OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = files.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can create files
CREATE POLICY "Users can create files" ON files
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = files.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can update their own files
CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = files.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = files.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('ADMIN', 'OWNER')
    )
  );

-- Add RLS policies for file_shares
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

-- Only file owners can create/view shares
CREATE POLICY "File owners can manage shares" ON file_shares
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = file_shares.file_id
      AND (
        files.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM organization_members
          WHERE organization_members.organization_id = files.organization_id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('user-files', 'user-files', false),
  ('public-files', 'public-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Public files policies
CREATE POLICY "Anyone can view public files" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-files');

CREATE POLICY "Authenticated users can upload public files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public-files' AND
    auth.role() = 'authenticated'
  );

-- Function to calculate storage usage
CREATE OR REPLACE FUNCTION get_storage_usage(p_user_id UUID, p_organization_id UUID DEFAULT NULL)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT SUM(size)
      FROM files
      WHERE (
        (p_organization_id IS NOT NULL AND organization_id = p_organization_id) OR
        (p_organization_id IS NULL AND user_id = p_user_id AND organization_id IS NULL)
      )
    ),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired shares
CREATE OR REPLACE FUNCTION clean_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM file_shares
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;