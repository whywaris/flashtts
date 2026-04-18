import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Call at the top of every admin API route.
 * Returns null if the caller is an authenticated admin.
 * Returns a 401/403 NextResponse otherwise — return it immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
