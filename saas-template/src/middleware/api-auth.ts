import { NextRequest, NextResponse } from 'next/server'
import { ApiKeyService } from '@/lib/api-keys/service'

export async function validateApiKeyMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }

  const apiKey = authHeader.substring(7)
  const validation = await ApiKeyService.validateApiKey(apiKey)

  if (!validation.valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', validation.user.id)
  requestHeaders.set('x-user-email', validation.user.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}