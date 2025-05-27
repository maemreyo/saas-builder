-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE org_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'CANCELED', 
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'PAST_DUE',
  'TRIALING',
  'UNPAID'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
