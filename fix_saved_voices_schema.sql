-- ================================================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ================================================================

-- Step 1: Add ALL missing columns to saved_voices table
ALTER TABLE saved_voices 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'library',
  ADD COLUMN IF NOT EXISTS r2_url TEXT;

-- Step 2: Verify all columns now exist
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'saved_voices'
ORDER BY ordinal_position;
