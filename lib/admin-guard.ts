import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = [
  'primezillayt01@gmail.com',
  'akbarhun0@gmail.com',
]

/**
 * Call at the top of every admin API route.
 * Returns null if the caller is an authenticated admin.
 * Returns a 401/403 NextResponse otherwise - return it immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = (user.email || '').toLowerCase().trim()
  const ownerEmail = (process.env.OWNER_NOTIFICATION_EMAIL || '').toLowerCase().trim()

  // 1. Check owner/admin email whitelist
  if (userEmail && (userEmail === ownerEmail || ADMIN_EMAILS.includes(userEmail))) {
    return null
  }

  // 2. Check profiles with service role key if available (bypasses RLS)
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
          return null
        }
      }
    } catch (e) {
      console.error('requireAdmin error:', e)
    }
  }

  // 3. Fallback to standard client query
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
