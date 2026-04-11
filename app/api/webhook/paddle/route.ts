import { createClient } from '@supabase/supabase-js';
import { PLANS } from "@/lib/plans";
import { PRICE_MAP } from "@/lib/paddle";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
