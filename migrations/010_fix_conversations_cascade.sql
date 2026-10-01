-- Fix conversations schema with CASCADE

-- ============================================
-- STEP 1: Drop ALL policies that might depend on maker_id
-- ============================================

-- Drop all conversation policies (CASCADE to remove dependencies)
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations CASCADE;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations CASCADE;

-- Drop all message policies that might reference maker_id
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can view their messages" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can insert messages" ON messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages" ON messages CASCADE;

-- ============================================
-- STEP 2: Now drop the maker_id column
-- ============================================

ALTER TABLE conversations 
DROP COLUMN IF EXISTS maker_id CASCADE;

ALTER TABLE conversations 
DROP COLUMN IF EXISTS customer_id CASCADE;

-- ============================================
-- STEP 3: Ensure correct columns exist
-- ============================================

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS title TEXT;

-- ============================================
-- STEP 4: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);

-- ============================================
-- STEP 5: Enable RLS and create policies
-- ============================================

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
-- STEP 6: Fix messages RLS
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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
-- STEP 7: Fix makers RLS (from migration 009)
-- ============================================

DROP POLICY IF EXISTS "Users can view makers" ON makers CASCADE;
DROP POLICY IF EXISTS "Users can insert own maker" ON makers CASCADE;
DROP POLICY IF EXISTS "Users can update own maker" ON makers CASCADE;
DROP POLICY IF EXISTS "Public can view verified makers" ON makers CASCADE;
DROP POLICY IF EXISTS "Anyone can view makers" ON makers CASCADE;
DROP POLICY IF EXISTS "Users can delete own maker" ON makers CASCADE;

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
