import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_EMAILS = [
  'primezillayt01@gmail.com',
  'akbarhun0@gmail.com',
]

async function checkIsAdmin(user: any): Promise<boolean> {
  if (!user) return false

  const userEmail = (user.email || '').toLowerCase().trim()
  const ownerEmail = (process.env.OWNER_NOTIFICATION_EMAIL || '').toLowerCase().trim()

  // 1. Direct owner/admin email whitelist check
  if (userEmail && (userEmail === ownerEmail || ADMIN_EMAILS.includes(userEmail))) {
    return true
  }

  // 2. Query Supabase profiles table using service role key (bypasses RLS)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceKey && supabaseUrl && user.id) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      })
      if (res.ok) {
        const rows = await res.json()
        if (Array.isArray(rows) && rows.length > 0 && rows[0].role === 'admin') {
          return true
        }
      }
    } catch (e) {
      console.error('Middleware admin profile check error:', e)
    }
  }

  return false
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // Static files and internal Next.js assets pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res
  }

  // Determine cookie domain for subdomains (.flashtts.com)
  const isProd = hostname.includes('flashtts.com')
  const cookieDomain = isProd ? '.flashtts.com' : undefined

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = { ...options }
            if (cookieDomain && !opts.domain) {
              opts.domain = cookieDomain
            }
            res.cookies.set(name, value, opts)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── ADMIN SUBDOMAIN (admin.flashtts.com / admin.localhost) ──
  const isAdminSubdomain =
    hostname === 'admin.flashtts.com' ||
    hostname.startsWith('admin.')

  if (isAdminSubdomain) {
    // Not logged in → redirect to main login with return URL
    if (!user) {
      const returnUrl = `https://${hostname}${pathname}`
      return NextResponse.redirect(
        new URL(`https://www.flashtts.com/login?next=${encodeURIComponent(returnUrl)}`, req.url)
      )
    }

    const isAdmin = await checkIsAdmin(user)

    // Not admin → redirect to main dashboard
    if (!isAdmin) {
      return NextResponse.redirect(
        new URL('https://www.flashtts.com/dashboard', req.url)
      )
    }

    // Admin confirmed
    const url = req.nextUrl.clone()

    if (pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url, { headers: res.headers })
    }

    if (pathname.startsWith('/admin')) {
      return res
    }

    url.pathname = '/admin' + pathname
    return NextResponse.rewrite(url, { headers: res.headers })
  }

  // ── MAIN DOMAIN /admin ROUTE (www.flashtts.com/admin) ──
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdminPath) {
    // Not logged in → login with next=/admin
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
      )
    }

    const isAdmin = await checkIsAdmin(user)

    // Not admin → dashboard
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin confirmed on main site
    return res
  }

  // ── MAIN SITE ROUTING ──
  const protectedPaths = ['/dashboard', '/settings', '/billing']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    )
  }

  // Auth pages - redirect if already logged in
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))

  if (isAuthPage && user) {
    const nextParam = req.nextUrl.searchParams.get('next')
    if (nextParam) {
      try {
        if (nextParam.startsWith('/')) {
          return NextResponse.redirect(new URL(nextParam, req.url))
        }
        const nextUrl = new URL(nextParam)
        if (nextUrl.hostname.endsWith('flashtts.com') || nextUrl.hostname === 'localhost') {
          return NextResponse.redirect(nextUrl)
        }
      } catch {}
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
