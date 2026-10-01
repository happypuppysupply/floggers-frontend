-- Migration 011: Create AI bot auth user + fix schema issues
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Create AI bot user in auth.users
-- This satisfies the FK constraint on conversations.user2_id
-- ============================================
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'bot@floggers.com',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Floggers Assistant"}',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Ensure bot has a profile row
-- (Triggers may auto-create this, but we ensure it)
-- ============================================
INSERT INTO profiles (
  id,
  first_name,
  last_name,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Floggers',
  'Assistant',
  'bot@floggers.com',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Verify conversations FK is intact
-- ============================================
-- The conversations table already has:
--   user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
--   user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
-- After inserting the bot user, these constraints will be satisfied.
