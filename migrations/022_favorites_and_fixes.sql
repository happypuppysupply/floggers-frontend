-- Migration 022: Create favorites table and fix remaining issues

-- Step 1: Create favorites/wishlist table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Step 2: Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to their favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Step 5: Create function to toggle favorite (add if not exists, remove if exists)
CREATE OR REPLACE FUNCTION toggle_favorite(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM favorites 
    WHERE user_id = p_user_id AND product_id = p_product_id
  ) INTO v_exists;
  
  IF v_exists THEN
    DELETE FROM favorites 
    WHERE user_id = p_user_id AND product_id = p_product_id;
    RETURN false; -- Now removed
  ELSE
    INSERT INTO favorites (user_id, product_id)
    VALUES (p_user_id, p_product_id);
    RETURN true; -- Now added
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_favorite(UUID, UUID) TO authenticated;

-- Step 6: Create function to check if product is favorited
CREATE OR REPLACE FUNCTION is_favorited(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM favorites 
    WHERE user_id = p_user_id AND product_id = p_product_id
  );
$$;

GRANT EXECUTE ON FUNCTION is_favorited(UUID, UUID) TO authenticated;

-- Step 7: Create function to get user's favorites with product details
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS TABLE (
  favorite_id UUID,
  product_id UUID,
  product_name TEXT,
  product_slug TEXT,
  product_price DECIMAL,
  product_image_url TEXT,
  maker_id UUID,
  maker_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    f.id as favorite_id,
    p.id as product_id,
    p.name as product_name,
    p.slug as product_slug,
    p.price as product_price,
    p.image_url as product_image_url,
    p.maker_id,
    m.name as maker_name,
    f.created_at
  FROM favorites f
  JOIN products p ON f.product_id = p.id
  LEFT JOIN makers m ON p.maker_id = m.id
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_user_favorites(UUID) TO authenticated;

-- Step 8: Fix get_related_products function (ensure it exists and works)
DROP FUNCTION IF EXISTS get_related_products(TEXT, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION get_related_products(
  p_product_id TEXT,
  p_maker_id TEXT,
  p_category_id TEXT,
  p_limit INTEGER DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price DECIMAL,
  image_url TEXT,
  maker_id UUID,
  maker_name TEXT,
  category_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_uuid UUID;
  v_maker_uuid UUID;
  v_category_uuid UUID;
BEGIN
  -- Safely convert inputs to UUID
  BEGIN
    v_product_uuid := p_product_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_product_uuid := NULL;
  END;
  
  BEGIN
    v_maker_uuid := p_maker_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_maker_uuid := NULL;
  END;
  
  BEGIN
    v_category_uuid := p_category_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_category_uuid := NULL;
  END;
  
  IF v_product_uuid IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    p.image_url,
    p.maker_id,
    m.name as maker_name,
    p.category_id
  FROM products p
  LEFT JOIN makers m ON p.maker_id = m.id
  WHERE p.id != v_product_uuid
    AND p.is_active = true
    AND (
      v_maker_uuid IS NULL OR v_category_uuid IS NULL 
      OR p.maker_id = v_maker_uuid 
      OR p.category_id = v_category_uuid
    )
  ORDER BY 
    CASE 
      WHEN p.maker_id = v_maker_uuid THEN 3
      WHEN p.category_id = v_category_uuid THEN 2
      ELSE 1
    END DESC,
    p.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO anon;

-- Step 9: Fix maker_reviews table
CREATE TABLE IF NOT EXISTS maker_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maker_id UUID NOT NULL REFERENCES makers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(maker_id, reviewer_id)
);

ALTER TABLE maker_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maker reviews are viewable by everyone"
  ON maker_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create maker reviews"
  ON maker_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own maker reviews"
  ON maker_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own maker reviews"
  ON maker_reviews FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_maker_reviews_maker_id ON maker_reviews(maker_id);

-- Step 10: Fix payouts table - ensure maker_id exists
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS maker_id UUID REFERENCES makers(id);

CREATE INDEX IF NOT EXISTS idx_payouts_maker_id ON payouts(maker_id);

-- Step 11: Create or replace function to create conversation between users
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user1_id UUID, p_user2_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Look for existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE (user1_id = p_user1_id AND user2_id = p_user2_id)
     OR (user1_id = p_user2_id AND user2_id = p_user1_id)
  LIMIT 1;
  
  -- If not found, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id)
    VALUES (p_user1_id, p_user2_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;

-- Step 12: Add notification column to conversations for unread count
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user1_unread_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user2_unread_count INTEGER DEFAULT 0;
