import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const API_KEY  = process.env.LEMONSQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

    if (!API_KEY) {
      console.error('Missing LEMONSQUEEZY_API_KEY');
      return NextResponse.redirect(new URL('/dashboard/billing?error=config', request.url));
    }

    let customerId: string | null = null;

    // 1. Try to get customer ID from local subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('lemonsqueezy_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    customerId = subscription?.lemonsqueezy_customer_id ?? null;

    // 2. Fallback: search LemonSqueezy by user email (handles manually-set plans
    //    or cases where the webhook hasn't populated the DB yet)
    if (!customerId && user.email) {
      const params = new URLSearchParams({ 'filter[email]': user.email });
      if (STORE_ID) params.set('filter[store_id]', STORE_ID);

      const searchRes = await fetch(
        `https://api.lemonsqueezy.com/v1/customers?${params}`,
        {
          headers: {
            Accept: 'application/vnd.api+json',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        customerId = searchData.data?.[0]?.id ?? null;
      } else {
        console.error('LemonSqueezy customer search failed', await searchRes.text());
      }
    }

    if (!customerId) {
      // No LS customer found — send back to billing with a message
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=no_subscription', request.url)
      );
    }

    // 3. Fetch the customer portal URL
    const portalRes = await fetch(
      `https://api.lemonsqueezy.com/v1/customers/${customerId}`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (!portalRes.ok) {
      console.error('LemonSqueezy customer fetch failed', await portalRes.text());
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=portal', request.url)
      );
    }

    const data = await portalRes.json();
    const portalUrl: string | undefined =
      data.data?.attributes?.urls?.customer_portal;

    if (!portalUrl) {
      console.error('No customer portal URL returned for customer', customerId);
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=portal', request.url)
      );
    }

    return NextResponse.redirect(portalUrl);
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/billing?error=portal', request.url)
    );
  }
}
