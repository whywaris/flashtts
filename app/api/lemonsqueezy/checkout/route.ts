import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, billing } = body as { variantId?: number; billing?: 'monthly' | 'yearly' };

    if (!variantId || !billing) {
      return NextResponse.json(
        { error: 'Missing required fields: variantId, billing' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkoutUrl = await createCheckout(variantId, user.id, user.email!, billing);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
