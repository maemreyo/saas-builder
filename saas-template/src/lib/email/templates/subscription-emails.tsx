import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

const baseStyles = {
  main: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  },
  h1: {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
  },
  text: {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'left' as const,
  },
  button: {
    backgroundColor: '#5469d4',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '200px',
    margin: '30px auto',
    padding: '12px',
  },
}

export function SubscriptionCreatedEmail({ userName }: { userName?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription is now active</Preview>
      <Body style={baseStyles.main}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.h1}>Welcome to Pro!</Heading>
          <Text style={baseStyles.text}>
            Hi {userName || 'there'},
          </Text>
          <Text style={baseStyles.text}>
            Your Pro subscription is now active! You have access to all premium features.
          </Text>
          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={baseStyles.button}>
            Go to Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

-- supabase/migrations/20240102000000_create_email_queue.sql

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  to TEXT[] NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX idx_email_queue_type ON email_queue(type);

-- Create updated_at trigger
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean old emails (optional)
CREATE OR REPLACE FUNCTION clean_old_emails()
RETURNS void AS $$
BEGIN
  DELETE FROM email_queue
  WHERE status = 'sent' AND sent_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM email_queue
  WHERE status = 'failed' AND attempts >= 3 AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access email queue
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Create email templates table (optional)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_template TEXT,
  text_template TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();