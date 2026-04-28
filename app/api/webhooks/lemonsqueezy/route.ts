import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { VARIANT_TO_PLAN, getCreditsForPlan, type PlanId } from '@/lib/plans';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') ?? '';
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Missing LEMONSQUEEZY_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const eventName: string = (meta?.event_name as string) ?? '';
  const customData = meta?.custom_data as Record<string, string> | undefined;
  const userId: string | undefined = customData?.user_id;
  const attrs = (data?.attributes as Record<string, unknown>) ?? {};

  try {
    switch (eventName) {
      case 'subscription_created': {
        const lsSubId = String(data?.id ?? '');
        const variantId = Number(attrs.variant_id);
        const planId = VARIANT_TO_PLAN[variantId];
        const customerId = String(attrs.customer_id ?? '');

        if (!userId || !planId) {
          console.error('subscription_created: missing userId or planId', { userId, variantId });
          return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        const credits = getCreditsForPlan(planId);

        // Remove any stale subscription for this user before inserting
        await supabaseAdmin
          .from('subscriptions')
          .delete()
          .eq('user_id', userId);

        await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          lemonsqueezy_subscription_id: lsSubId,
          lemonsqueezy_customer_id: customerId,
          variant_id: String(variantId),
          plan: planId,
          status: String(attrs.status ?? 'active'),
          current_period_start: attrs.created_at,
          current_period_end: attrs.renews_at,
          cancel_at_period_end: false,
        });

        await supabaseAdmin
          .from('profiles')
          .update({ plan: planId, credits_limit: credits })
          .eq('id', userId);

        break;
      }

      case 'subscription_updated': {
        const lsSubId = String(data?.id ?? '');
        const variantId = Number(attrs.variant_id);
        const planId = VARIANT_TO_PLAN[variantId];
        const customerId = String(attrs.customer_id ?? '');
        const cancelled = Boolean(attrs.cancelled);
        const status = cancelled ? 'cancelled' : String(attrs.status ?? 'active');

        // Resolve user_id from custom_data or from stored subscription
        let resolvedUserId = userId;
        if (!resolvedUserId) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('lemonsqueezy_subscription_id', lsSubId)
            .single();
          resolvedUserId = sub?.user_id as string | undefined;
        }

        if (!resolvedUserId) {
          console.error('subscription_updated: cannot resolve user_id for', lsSubId);
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Fallback: keep existing plan if variant not mapped
        let effectivePlanId: PlanId | undefined = planId;
        let effectiveCredits: number;
        if (!effectivePlanId) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('plan')
            .eq('lemonsqueezy_subscription_id', lsSubId)
            .single();
          effectivePlanId = sub?.plan as PlanId | undefined;
        }
        effectiveCredits = effectivePlanId ? getCreditsForPlan(effectivePlanId) : 10000;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: effectivePlanId,
            status,
            variant_id: variantId ? String(variantId) : undefined,
            lemonsqueezy_customer_id: customerId || undefined,
            current_period_end: attrs.renews_at,
            cancel_at_period_end: cancelled,
            updated_at: new Date().toISOString(),
          })
          .eq('lemonsqueezy_subscription_id', lsSubId);

        await supabaseAdmin
          .from('profiles')
          .update({ plan: effectivePlanId, credits_limit: effectiveCredits })
          .eq('id', resolvedUserId);

        break;
      }

      case 'subscription_cancelled': {
        const lsSubId = String(data?.id ?? '');

        let resolvedUserId = userId;
        if (!resolvedUserId) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('lemonsqueezy_subscription_id', lsSubId)
            .single();
          resolvedUserId = sub?.user_id as string | undefined;
        }

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('lemonsqueezy_subscription_id', lsSubId);

        if (resolvedUserId) {
          await supabaseAdmin
            .from('profiles')
            .update({ plan: 'free', credits_limit: 10000 })
            .eq('id', resolvedUserId);
        }

        break;
      }

      case 'subscription_payment_success': {
        // data.type === 'subscription-invoices', attrs.subscription_id is the LS sub ID
        const lsSubId = String(attrs.subscription_id ?? '');

        let resolvedUserId = userId;
        if (!resolvedUserId && lsSubId) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('lemonsqueezy_subscription_id', lsSubId)
            .single();
          resolvedUserId = sub?.user_id as string | undefined;
        }

        if (!resolvedUserId) {
          console.warn('subscription_payment_success: cannot resolve user for sub', lsSubId);
          break;
        }

        // Reset monthly usage on successful payment (new billing cycle)
        await supabaseAdmin
          .from('profiles')
          .update({ credits_used: 0 })
          .eq('id', resolvedUserId);

        // Update period end if available
        if (attrs.renews_at && lsSubId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              current_period_end: attrs.renews_at,
              updated_at: new Date().toISOString(),
            })
            .eq('lemonsqueezy_subscription_id', lsSubId);
        }

        break;
      }

      default:
        console.log(`Unhandled LemonSqueezy event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
