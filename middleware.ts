import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // ── Supabase client ──
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Admin Subdomain Routing ──
  const isAdminSubdomain = 
    hostname === 'admin.flashtts.com' ||
    hostname.startsWith('admin.')

  if (isAdminSubdomain) {
    // Not logged in → login page
    if (!user) {
      return NextResponse.redirect(
        new URL('https://flashtts.com/login?redirect=admin', req.url)
      )
    }

    // Check admin role in DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Not admin → back to dashboard
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(
        new URL('https://flashtts.com/dashboard', req.url)
      )
    }

    // Is admin → rewrite to /admin routes
    const url = req.nextUrl.clone()
    
    // Root → /admin
    if (pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // /dashboard → /admin/dashboard etc
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname}`
      return NextResponse.rewrite(url)
    }

    return res
  }

  // ── Main Site Auth ──
  const isProtectedRoute = pathname.startsWith('/dashboard')

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' 
  ],
}