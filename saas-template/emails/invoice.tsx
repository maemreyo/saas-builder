import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'
import * as React from 'react'

interface InvoiceEmailProps {
  invoiceNumber: string
  customerName: string
  amount: string
  dueDate: string
  items: Array<{
    description: string
    quantity: number
    price: string
    total: string
  }>
  downloadLink: string
}

export const InvoiceEmail = ({
  invoiceNumber,
  customerName,
  amount,
  dueDate,
  items,
  downloadLink,
}: InvoiceEmailProps) => (
  <Html>
    <Head />
    <Preview>Invoice #{invoiceNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invoice #{invoiceNumber}</Heading>
        
        <Text style={text}>
          Hi {customerName},
        </Text>
        
        <Text style={text}>
          Thank you for your business. Please find your invoice details below:
        </Text>

        <Section style={invoiceDetails}>
          <Row>
            <Column>
              <Text style={label}>Invoice Number:</Text>
              <Text style={value}>{invoiceNumber}</Text>
            </Column>
            <Column>
              <Text style={label}>Due Date:</Text>
              <Text style={value}>{dueDate}</Text>
            </Column>
          </Row>
        </Section>

        <Section style={itemsTable}>
          <Text style={tableHeader}>Items</Text>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemDescription}>
                <Text>{item.description}</Text>
              </Column>
              <Column style={itemQuantity}>
                <Text>{item.quantity}</Text>
              </Column>
              <Column style={itemPrice}>
                <Text>{item.price}</Text>
              </Column>
              <Column style={itemTotal}>
                <Text>{item.total}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Section style={totalSection}>
          <Row>
            <Column style={totalLabel}>
              <Text style={totalText}>Total Due:</Text>
            </Column>
            <Column style={totalAmount}>
              <Text style={totalText}>{amount}</Text>
            </Column>
          </Row>
        </Section>

        <Link href={downloadLink} style={button}>
          Download Invoice
        </Link>

        <Text style={footer}>
          If you have any questions about this invoice, please contact our
          support team.
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

const invoiceDetails = {
  margin: '30px 0',
}

const label = {
  color: '#666',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  marginBottom: '5px',
}

const value = {
  fontSize: '16px',
  color: '#333',
}

const itemsTable = {
  width: '100%',
  margin: '30px 0',
}

const tableHeader = {
  fontSize: '14px',
  color: '#666',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  borderBottom: '1px solid #eee',
  paddingBottom: '5px',
  marginBottom: '10px',
}

const itemRow = {
  borderBottom: '1px solid #eee',
  padding: '10px 0',
}

const itemDescription = {
  width: '50%',
}

const itemQuantity = {
  width: '15%',
}

const itemPrice = {
  width: '15%',
}

const itemTotal = {
  width: '20%',
}

const totalSection = {
  margin: '30px 0',
  borderTop: '1px solid #eee',
  paddingTop: '15px',
}

const totalLabel = {
  width: '80%',
  textAlign: 'right' as const,
}

const totalAmount = {
  width: '20%',
}

const totalText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
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
  marginTop: '60px',
}

export default InvoiceEmail
