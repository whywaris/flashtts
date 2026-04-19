import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const PLAN_LIMITS: Record<string, number> = {
  free: 10000,
  starter: 200000,
  creator: 500000,
  pro: 1000000,
  studio: 3000000,
}

export async function POST(req: NextRequest) {
  // Verify caller is admin using their session (anon key + cookie)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, action, payload } = await req.json()
  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Use service role to bypass RLS for cross-user writes
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (action === 'update_plan') {
    const { plan } = payload
    if (!PLAN_LIMITS[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    const { error } = await admin
      .from('profiles')
      .update({ plan, credits_limit: PLAN_LIMITS[plan] })
      .eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ credits_limit: PLAN_LIMITS[plan] })
  }

  if (action === 'update_credits') {
    const { credits_limit } = payload
    const val = parseInt(credits_limit, 10)
    if (isNaN(val) || val <= 0 || val > 999999999) {
      return NextResponse.json({ error: 'Invalid credits value' }, { status: 400 })
    }
    const { error } = await admin
      .from('profiles')
      .update({ credits_limit: val })
      .eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ credits_limit: val })
  }

  if (action === 'ban') {
    const { is_banned, banned_reason } = payload
    const { error } = await admin
      .from('profiles')
      .update({ is_banned, banned_reason: is_banned ? (banned_reason ?? null) : null })
      .eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
