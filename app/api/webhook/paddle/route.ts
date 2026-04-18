import { createClient } from '@supabase/supabase-js';
import { PLANS } from "@/lib/plans";
import { PRICE_MAP } from "@/lib/paddle";
import { createHmac, timingSafeEqual } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyPaddleSignature(req: Request): Promise<{ valid: boolean; rawBody: string }> {
  const signature = req.headers.get('Paddle-Signature');
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!signature || !secret || secret === 'xxxx') {
    return { valid: false, rawBody: '' };
  }

  const rawBody = await req.text();

  // Format: ts=<timestamp>;h1=<hmac_hex>
  const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')));
  const ts = parts['ts'];
  const h1 = parts['h1'];

  if (!ts || !h1) return { valid: false, rawBody };

  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

  try {
    const valid = timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expected, 'hex'));
    return { valid, rawBody };
  } catch {
    return { valid: false, rawBody };
  }
}

export async function POST(req: Request) {
  try {
    const { valid, rawBody } = await verifyPaddleSignature(req);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event_type;

    if (event === "transaction.completed") {
      const data = body.data;

      const priceId = data.items[0].price.id;
      const userId = data.custom_data?.user_id;

      if (!userId) {
        return new Response("Missing user_id", { status: 400 });
      }

      const planKey = PRICE_MAP[priceId];

      if (!planKey) {
        return new Response("Invalid priceId", { status: 400 });
      }

      const plan = (PLANS as any)[planKey];

      // 🔥 UPDATE USER
      await supabase
        .from("profiles")
        .update({
          plan: planKey,
          credits_limit: plan.credits,
          credits_used: 0
        })
        .eq("id", userId);
    } 
    else if (event === "subscription.canceled") {
      const userId = body.data.custom_data?.user_id;
      
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            plan: "free",
            credits_limit: 10000
          })
          .eq("id", userId);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error: any) {
    console.error("Paddle Webhook Error:", error);
    return new Response(error.message || "Webhook Error", { status: 500 });
  }
}
