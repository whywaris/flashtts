import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── ADMIN SUBDOMAIN ──
  const isAdminSubdomain =
    hostname === 'admin.flashtts.com' ||
    hostname.startsWith('admin.')

  if (isAdminSubdomain) {
    // Static files and API routes pass through before any auth check
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')
    ) {
      return res
    }

    // Not logged in → main site login
    if (!user) {
      return NextResponse.redirect(
        new URL('https://www.flashtts.com/login', req.url)
      )
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Not admin → main dashboard
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(
        new URL('https://www.flashtts.com/dashboard', req.url)
      )
    }

    // Admin confirmed ✅
    const url = req.nextUrl.clone()

    // Root → /admin
    if (pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // Already /admin/* → pass through
    if (pathname.startsWith('/admin')) {
      return res
    }

    // Anything else → prefix /admin
    url.pathname = '/admin' + pathname
    return NextResponse.rewrite(url)
  }

  // ── MAIN SITE ROUTING ──
  // Dashboard protected routes
  const protectedPaths = ['/dashboard', '/settings', '/billing']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Auth pages — redirect to dashboard if already logged in
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
