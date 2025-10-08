import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If user is authenticated but accessing auth pages, redirect to app
    if ((req.nextUrl.pathname === '/signin' || req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/auth') && req.nextauth.token) {
      return NextResponse.redirect(new URL('/app', req.url))
    }
    
    // Auto-set current organization cookie if user has organizations but no current org
    if (req.nextauth.token && req.nextUrl.pathname.startsWith('/app/')) {
      const token = req.nextauth.token as any;
      const currentOrgCookie = req.cookies.get('currentOrgId');
      
      if (token.orgs && token.orgs.length > 0 && !currentOrgCookie) {
        const response = NextResponse.next();
        response.cookies.set('currentOrgId', token.orgs[0].id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
        return response;
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
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
          return true
        }
        
        // Require authentication for /app/** and protected APIs
        if (pathname.startsWith('/app/') || 
            (pathname.startsWith('/api/') && 
             !pathname.startsWith('/api/auth/'))) {
          return !!token
        }
        
        return true
      },
    },
  }
)

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



