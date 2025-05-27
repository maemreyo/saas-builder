import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ['/dashboard', '/admin', '/settings', '/billing']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Check if user is admin
    // Implementation depends on your user role structure
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
