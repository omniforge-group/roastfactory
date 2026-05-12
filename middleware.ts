import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith('/admin');

  if (isAdminPath) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }

    const [username, password] = atob(authHeader.split(' ')[1]).split(':');

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse('Access denied', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|survey|dashboard-sf-intern|.*\\..*).*)']
};
