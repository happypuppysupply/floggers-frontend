-- Migration 015: Online presence tracking for messaging

-- Add last_active timestamp to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- Add online status index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Function to format relative time for messages (minutes/hours/days)
-- This is helper info only, actual formatting done in frontend

-- Allow users to update their own last_active (needed for presence heartbeat)
-- We need a policy that lets authenticated users update only their own last_active

-- First drop any existing policy that might conflict
DROP POLICY IF EXISTS "Users can update own last_active" ON profiles;

CREATE POLICY "Users can update own last_active" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

SELECT 'Migration 015 completed' AS status;
