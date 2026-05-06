const BASE_URL = 'https://api.lemonsqueezy.com/v1';

function headers() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error('Missing LEMONSQUEEZY_API_KEY');
  return {
    Authorization: `Bearer ${key}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
}

export async function createCheckout(
  variantId: number,
  userId: string,
  userEmail: string,
  _billing: 'monthly' | 'yearly'
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error('Missing LEMONSQUEEZY_STORE_ID');

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://flashtts.com';

  const res = await fetch(`${BASE_URL}/checkouts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${siteUrl}/dashboard/billing?checkout=success`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LemonSqueezy checkout error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const url: string | undefined = json.data?.attributes?.url;
  if (!url) throw new Error('LemonSqueezy returned no checkout URL');
  return url;
}

export async function getSubscription(subscriptionId: string) {
  const res = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to fetch subscription ${subscriptionId}: ${res.status}`);
  return res.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const res = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to cancel subscription ${subscriptionId}: ${res.status}`);
  return res.json();
}
