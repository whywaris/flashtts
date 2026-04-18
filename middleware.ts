import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''
    const isAdminSubdomain = 
        hostname === 'admin.flashtts.com' ||
        hostname === 'admin.localhost:3000'

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Handle Admin Subdomain Routing
    if (isAdminSubdomain) {
        // Not logged in -> redirect to login
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Not admin -> redirect to main dashboard
        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('https://flashtts.com/dashboard', request.url))
        }

        // Is admin -> rewrite root to /admin
        const url = request.nextUrl.clone()
        if (url.pathname === '/') {
            url.pathname = '/admin'
            return NextResponse.rewrite(url)
        }
        
        return supabaseResponse
    }

    // --- Normal flashtts.com routing below ---

    // Require authentication for dashboard and admin routes
    if (!user && (
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/admin')
    )) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Require admin role for /admin routes on main domain
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect already-logged-in users away from auth pages
    if (user && (
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup'
    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}