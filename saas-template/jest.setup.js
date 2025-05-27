import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}))
