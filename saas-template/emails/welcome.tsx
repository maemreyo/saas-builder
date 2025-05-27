import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userFirstName: string
  loginLink: string
}

export const WelcomeEmail = ({
  userFirstName,
  loginLink,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to our SaaS platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome, {userFirstName}!</Heading>
        <Text style={text}>
          We're excited to have you on board. Your account has been successfully
          created and you're ready to start using our platform.
        </Text>
        <Link href={loginLink} style={button}>
          Get Started
        </Link>
        <Text style={text}>
          If you have any questions, feel free to reach out to our support team.
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
  textAlign: 'center' as const,
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
  textAlign: 'center' as const,
  marginTop: '64px',
}

export default WelcomeEmail
