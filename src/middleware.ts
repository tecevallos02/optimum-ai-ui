import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If user is authenticated but accessing /signin, redirect to app
    if (req.nextUrl.pathname === '/signin' && req.nextauth.token) {
      return NextResponse.redirect(new URL('/app', req.url))
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
          pathname.startsWith('/api/auth/') ||
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



