import { NextRequest, NextResponse } from 'next/server';

function unauthorized() {
  return new NextResponse('Toegang geweigerd', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="RoastFactory Admin"' },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const auth = req.headers.get('authorization') ?? '';
    const [scheme, encoded] = auth.split(' ');
    if (scheme !== 'Basic' || !encoded) return unauthorized();

    const decoded = atob(encoded);
    const colonIdx = decoded.indexOf(':');
    const user = decoded.slice(0, colonIdx);
    const pass = decoded.slice(colonIdx + 1);

    if (
      user !== process.env.ADMIN_USERNAME ||
      pass !== process.env.ADMIN_PASSWORD
    ) {
      return unauthorized();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
