-- Fix RLS policies and conversations schema

-- ============================================
-- FIX 1: Makers RLS Policy
-- Allow users to insert their own maker record
-- ============================================

-- First, check existing policies on makers
DROP POLICY IF EXISTS "Users can view makers" ON makers;
DROP POLICY IF EXISTS "Users can insert own maker" ON makers;
DROP POLICY IF EXISTS "Users can update own maker" ON makers;
DROP POLICY IF EXISTS "Public can view verified makers" ON makers;

-- Enable RLS (if not already)
ALTER TABLE makers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view makers
CREATE POLICY "Anyone can view makers" ON makers
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own maker
CREATE POLICY "Users can insert own maker" ON makers
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Policy: Users can update their own maker
CREATE POLICY "Users can update own maker" ON makers
  FOR UPDATE USING (auth.uid() = profile_id);

-- Policy: Users can delete their own maker
CREATE POLICY "Users can delete own maker" ON makers
  FOR DELETE USING (auth.uid() = profile_id);

-- ============================================
-- FIX 2: Conversations Schema
-- Remove maker_id requirement - conversations are user-to-user
-- ============================================

-- Check if maker_id exists and drop it (conversations are between users, not makers)
ALTER TABLE conversations 
DROP COLUMN IF EXISTS maker_id;

-- Also drop any other incorrect columns that might exist
ALTER TABLE conversations 
DROP COLUMN IF EXISTS customer_id;

-- Make sure we have the correct columns
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add title/subject column for conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);

-- Drop all existing policies and recreate
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Policy: Authenticated users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (auth.uid() = user1_id OR auth.uid() = user2_id)
  );

-- Policy: Users can update conversations they're part of
CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================
-- FIX 3: Messages RLS
-- ============================================

-- Make sure messages table has proper RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

-- Policy: Users can view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Policy: Users can insert messages to conversations they participate in
CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- ============================================
-- FIX 4: Ensure products table has correct RLS
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Makers can insert their own products" ON products;
DROP POLICY IF EXISTS "Makers can update their own products" ON products;
DROP POLICY IF EXISTS "Makers can delete their own products" ON products;

-- Anyone can view active products
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM makers WHERE makers.id = products.maker_id AND makers.profile_id = auth.uid()
  ));

-- Makers can insert products
CREATE POLICY "Makers can insert their own products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM makers WHERE makers.id = products.maker_id AND makers.profile_id = auth.uid()
    )
  );

-- Makers can update their products
CREATE POLICY "Makers can update their own products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM makers WHERE makers.id = products.maker_id AND makers.profile_id = auth.uid()
    )
  );

-- Makers can delete their products
CREATE POLICY "Makers can delete their own products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM makers WHERE makers.id = products.maker_id AND makers.profile_id = auth.uid()
    )
  );
