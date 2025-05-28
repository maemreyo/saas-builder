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

interface VerificationEmailProps {
  verificationLink: string
  userName?: string
}

export const VerificationEmail = ({
  verificationLink,
  userName = 'there',
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify your email address</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Thanks for signing up! Please verify your email address by clicking the
          button below:
        </Text>

        <Section style={buttonContainer}>
          <Button href={verificationLink} style={button}>
            Verify Email Address
          </Button>
        </Section>

        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        
        <Text style={link}>
          {verificationLink}
        </Text>

        <Text style={text}>
          This link will expire in 24 hours. If you didn't create an account,
          you can safely ignore this email.
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
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
}

const link = {
  color: '#5469d4',
  fontSize: '14px',
  textAlign: 'left' as const,
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  textAlign: 'left' as const,
  marginTop: '64px',
}

export default VerificationEmail