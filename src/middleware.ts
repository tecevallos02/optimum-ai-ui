import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

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

  // Handle ADMIN routes
  if (pathname.startsWith('/admin')) {
    // Get admin token (using admin session name)
    const adminToken = await getToken({ 
      req: request, 
      secret: process.env.ADMIN_NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET,
      cookieName: process.env.ADMIN_SESSION_NAME || 'admin-next-auth.session-token'
    })

    // If no admin session and trying to access admin routes
    if (!adminToken) {
      if (pathname === '/admin/login') {
        return NextResponse.next() // Allow access to login page
      }
      // Redirect to admin login with redirect parameter
      const redirectUrl = new URL('/admin/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If admin session exists but trying to access login page, redirect to admin dashboard
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Allow access to admin routes
    return NextResponse.next()
  }

  // Handle USER routes
  if (pathname.startsWith('/app/') || 
      (pathname.startsWith('/api/') && 
       !pathname.startsWith('/api/admin/') &&
       !pathname.startsWith('/api/auth/'))) {
    
    // Get user token (using default session name)
    const userToken = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token'
    })

    // If no user session, redirect to login
    if (!userToken) {
      if (pathname === '/login' || pathname === '/signin') {
        return NextResponse.next() // Allow access to login page
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user session exists but trying to access login page, redirect to app
    if (pathname === '/login' || pathname === '/signin') {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    // Auto-set current organization cookie if user has organizations but no current org
    if (userToken && pathname.startsWith('/app/')) {
      const currentOrgCookie = request.cookies.get('currentOrgId');
      
      if (userToken.orgs && userToken.orgs.length > 0 && !currentOrgCookie) {
        const response = NextResponse.next();
        response.cookies.set('currentOrgId', userToken.orgs[0].id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
        return response;
      }
    }

    // Allow access to user routes
    return NextResponse.next()
  }

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



