import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const LEMON_API_URL = 'https://api.lemonsqueezy.com/v1/checkouts';

export async function POST(request: NextRequest) {
  try {
    const { variantId, userId, userEmail } = await request.json();

    if (!variantId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: variantId, userId, userEmail' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
    const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

    if (!STORE_ID || !API_KEY) {
      console.error('Missing LemonSqueezy environment variables');
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Create LemonSqueezy checkout
    const response = await fetch(LEMON_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: {
                user_id: userId,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://flashtts.com'}/dashboard/settings?checkout=success`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: String(variantId),
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LemonSqueezy checkout error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const checkoutData = await response.json();
    const checkoutUrl = checkoutData.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
