-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

CREATE OR REPLACE FUNCTION increment_credits(user_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET credits_used = credits_used + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
