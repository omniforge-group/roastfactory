import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    const adminUser = process.env.ADMIN_USERNAME || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || 'password'
    const expected = 'Basic ' + Buffer.from(`${adminUser}:${adminPass}`).toString('base64')
    if (authHeader !== expected) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
      })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
