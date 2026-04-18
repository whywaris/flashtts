-- Run this in Supabase SQL Editor
-- Atomically deducts credits, returns TRUE if successful, FALSE if insufficient balance.
-- Prevents race conditions when multiple concurrent TTS requests are made.

CREATE OR REPLACE FUNCTION deduct_credits_atomic(p_user_id uuid, p_amount int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used    bigint;
  v_limit   bigint;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT credits_used, credits_limit
    INTO v_used, v_limit
    FROM profiles
   WHERE id = p_user_id
     FOR UPDATE;

  -- Reject if insufficient credits
  IF v_used + p_amount > v_limit THEN
    RETURN false;
  END IF;

  UPDATE profiles
     SET credits_used = credits_used + p_amount
   WHERE id = p_user_id;

  RETURN true;
END;
$$;
