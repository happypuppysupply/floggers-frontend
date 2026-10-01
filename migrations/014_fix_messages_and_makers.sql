-- Migration 014: Fix messages column, add maker is_live, clean duplicate AI chats

-- ============================================
-- STEP 1: Fix messages table — rename text to content
-- (Frontend uses 'content', backend SQL created 'text')
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'text'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'content'
  ) THEN
    ALTER TABLE messages RENAME COLUMN text TO content;
  END IF;
END $$;

-- Ensure content column exists (if table was created with content already)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content TEXT;

-- Make content NOT NULL if it has data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM messages WHERE content IS NOT NULL) THEN
    ALTER TABLE messages ALTER COLUMN content SET NOT NULL;
  END IF;
END $$;

-- ============================================
-- STEP 2: Add is_live column to makers for sandbox/live toggle
-- ============================================
ALTER TABLE makers ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;

-- Existing approved makers should default to false (sandbox)
UPDATE makers SET is_live = false WHERE is_live IS NULL;

-- ============================================
-- STEP 3: Clean up duplicate AI bot conversations
-- Keep only the most recent AI conversation per user
-- ============================================
DELETE FROM conversations
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id)
             ORDER BY created_at DESC
           ) as rn
    FROM conversations
    WHERE user1_id = '00000000-0000-0000-0000-000000000001'
       OR user2_id = '00000000-0000-0000-0000-000000000001'
  ) sub
  WHERE rn > 1
);

-- ============================================
-- STEP 4: Ensure messages RLS works for both human and bot
-- Recreate insert policy to allow both sides of a conversation
-- ============================================
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );
