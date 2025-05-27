'use client'

import { format } from 'date-fns'
import { useBilling } from '@/hooks/use-billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export function BillingHistory() {
  const { invoices } = useBilling()

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>Download your past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No invoices yet
          </p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(invoice.created * 1000), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                  {invoice.invoice_pdf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                        <Icons.download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}