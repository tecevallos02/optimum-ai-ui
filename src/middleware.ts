import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (
    pathname === '/' ||
    pathname === '/signin' ||
    pathname === '/login' ||
    pathname === '/auth' ||
    pathname === '/verify' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/test-db') ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next()
  }

  // For now, allow all other routes
  // Authentication will be handled by the pages themselves
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}



