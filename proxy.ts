import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy for route protection
 * - Protects /dashboard routes (requires authentication)
 * - Redirects authenticated users away from /login and /signup
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get tokens from cookies (if using httpOnly cookies) or check localStorage via header
    // For now, we'll check for a custom header that the client sets
    // In production, you might want to use httpOnly cookies instead
    const accessToken = request.cookies.get('accessToken')?.value
    const hasToken = !!accessToken

    // Protected routes - require authentication
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/portfolio') || pathname.startsWith('/settings') || pathname.startsWith('/admin')) {
        if (!hasToken) {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Auth routes - redirect if already authenticated
    if (pathname === '/login' || pathname === '/signup') {
        if (hasToken) {
            // Redirect to dashboard if already authenticated
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

