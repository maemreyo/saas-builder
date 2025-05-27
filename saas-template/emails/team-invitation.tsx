import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface TeamInvitationEmailProps {
  inviteLink: string
  inviterName: string
  teamName: string
  recipientEmail: string
  inviteExpiry?: string
}

export const TeamInvitationEmail = ({
  inviteLink,
  inviterName,
  teamName,
  recipientEmail,
  inviteExpiry = '7 days',
}: TeamInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Join {teamName} on our platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Team Invitation</Heading>
        
        <Text style={text}>
          Hi there,
        </Text>
        
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join <strong>{teamName}</strong> on our platform.
        </Text>
        
        <Section style={details}>
          <Text style={detailsText}>
            <strong>Team:</strong> {teamName}
          </Text>
          <Text style={detailsText}>
            <strong>Invited by:</strong> {inviterName}
          </Text>
          <Text style={detailsText}>
            <strong>Email:</strong> {recipientEmail}
          </Text>
        </Section>

        <Button href={inviteLink} style={button}>
          Accept Invitation
        </Button>

        <Text style={text}>
          This invitation will expire in {inviteExpiry}. If you have any questions, 
          you can reply directly to this email.
        </Text>
        
        <Text style={text}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>

        <Text style={footer}>
          Best regards,
          <br />
          The Team
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
  marginBottom: '20px',
}

const details = {
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
}

const detailsText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '5px 0',
}

const button = {
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
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  textAlign: 'left' as const,
  marginTop: '64px',
}

export default TeamInvitationEmail
