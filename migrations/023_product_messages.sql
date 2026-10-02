-- Migration 023: Add product_id to messages for product context

-- Add product_id column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

-- Add metadata column for rich message data (shipping info, materials, etc.)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for product lookups
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id);
