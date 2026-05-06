-- Add LemonSqueezy variant ID columns
ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id_monthly bigint,
  ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id_yearly  bigint;

-- Remove outdated plans
DELETE FROM pricing_plans WHERE name IN ('Agency', 'Stripe');

-- Upsert all 5 plans
INSERT INTO pricing_plans (
  name,
  price_monthly,
  chars_per_month,
  daily_char_limit,
  max_clones,
  max_api_keys,
  has_watermark,
  has_api_access,
  has_commercial_license,
  has_bulk_upload,
  unlimited_voices,
  lemonsqueezy_variant_id_monthly,
  lemonsqueezy_variant_id_yearly,
  is_active,
  sort_order
) VALUES
  -- Free
  ('free',    0,  10000,   500,  1,  0, true,  false, false, false, false, NULL,    NULL,    true, 1),
  -- Starter
  ('starter', 9,  200000,  3000, 3,  0, false, false, true,  false, false, 1618553, 1618565, true, 2),
  -- Creator
  ('creator', 19, 600000,  5000, 10, 0, false, false, true,  true,  false, 1618555, 1618567, true, 3),
  -- Pro
  ('pro',     39, 2000000, 10000,25, 1, false, true,  true,  true,  true,  1618556, 1618573, true, 4),
  -- Studio
  ('studio',  79, 3000000, 20000,NULL,3,false, true,  true,  true,  true,  1618558, 1618576, true, 5)
ON CONFLICT (name) DO UPDATE SET
  price_monthly                   = EXCLUDED.price_monthly,
  chars_per_month                 = EXCLUDED.chars_per_month,
  daily_char_limit                = EXCLUDED.daily_char_limit,
  max_clones                      = EXCLUDED.max_clones,
  max_api_keys                    = EXCLUDED.max_api_keys,
  has_watermark                   = EXCLUDED.has_watermark,
  has_api_access                  = EXCLUDED.has_api_access,
  has_commercial_license          = EXCLUDED.has_commercial_license,
  has_bulk_upload                 = EXCLUDED.has_bulk_upload,
  unlimited_voices                = EXCLUDED.unlimited_voices,
  lemonsqueezy_variant_id_monthly = EXCLUDED.lemonsqueezy_variant_id_monthly,
  lemonsqueezy_variant_id_yearly  = EXCLUDED.lemonsqueezy_variant_id_yearly,
  is_active                       = EXCLUDED.is_active,
  sort_order                      = EXCLUDED.sort_order;
