import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get admin emails from environment
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || ['goshawkai1@gmail.com']
  
  // Always allow public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signin' ||
    pathname === '/auth' ||
    pathname === '/verify' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/test-db') ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next()
  }

  // Get session token
  const token = await getToken({ req: request })
  
  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.headers.set('X-Guard', 'admin-no-auth')
      return response
    }
    
    // Check if user is admin
    const userEmail = token.email
    if (!userEmail || !adminEmails.includes(userEmail)) {
      // Not admin, redirect to home
      const response = NextResponse.redirect(new URL('/', request.url))
      response.headers.set('X-Guard', 'admin-not-admin')
      return response
    }
    
    // Admin user, allow access
    const response = NextResponse.next()
    response.headers.set('X-Guard', 'admin-allowed')
    return response
  }

  // Handle protected routes (app routes)
  if (pathname.startsWith('/app')) {
    if (!token) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Authenticated user, allow access
    return NextResponse.next()
  }

  // Handle other protected routes
  const protectedRoutes = ['/dashboard', '/contacts', '/billing', '/config', '/calls', '/calendar', '/savings', '/team', '/audit']
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Authenticated user, allow access
    return NextResponse.next()
  }

  // Allow all other routes
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



