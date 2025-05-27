import { cn, formatCurrency, formatDate } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', { 'text-red': true, 'text-blue': false })).toBe('base text-red')
    })
  })

  describe('formatCurrency', () => {
    it('should format cents to dollars', () => {
      expect(formatCurrency(1000)).toBe('$10.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€10.00')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-01'
      expect(formatDate(date)).toContain('January')
    })
  })
})
