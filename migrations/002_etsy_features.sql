-- Phase 2: Etsy-Inspired Features Migration
-- 1. Product shipping info
-- 2. Maker follows
-- 3. Purchase-verified reviews

-- ============================================
-- 1. ADD SHIPPING FIELDS TO PRODUCTS
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_time_min INTEGER, -- days
ADD COLUMN IF NOT EXISTS shipping_time_max INTEGER, -- days
ADD COLUMN IF NOT EXISTS shipping_policies TEXT, -- free text for policies
ADD COLUMN IF NOT EXISTS free_shipping_over DECIMAL(10,2), -- e.g., 150 for free shipping over $150
ADD COLUMN IF NOT EXISTS ships_from VARCHAR(255); -- city, state or country

COMMENT ON COLUMN products.shipping_cost IS 'Base shipping cost for this product';
COMMENT ON COLUMN products.shipping_time_min IS 'Minimum delivery time in days';
COMMENT ON COLUMN products.shipping_time_max IS 'Maximum delivery time in days';
COMMENT ON COLUMN products.shipping_policies IS 'Custom shipping policies (returns, exchanges, etc.)';
COMMENT ON COLUMN products.free_shipping_over IS 'Order threshold for free shipping (NULL if no threshold)';
COMMENT ON COLUMN products.ships_from IS 'Location item ships from for delivery estimates';

-- ============================================
-- 2. CREATE MAKER FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS maker_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  maker_id UUID REFERENCES makers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, maker_id) -- prevent duplicate follows
);

-- Enable RLS
ALTER TABLE maker_follows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own follows" 
  ON maker_follows FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow makers" 
  ON maker_follows FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow makers" 
  ON maker_follows FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow viewing follower counts publicly
CREATE POLICY "Anyone can view follower counts" 
  ON maker_follows FOR SELECT 
  USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_maker_follows_user ON maker_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_maker_follows_maker ON maker_follows(maker_id);

-- Function to get follower count for a maker
CREATE OR REPLACE FUNCTION get_maker_follower_count(p_maker_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM maker_follows WHERE maker_id = p_maker_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user follows maker
CREATE OR REPLACE FUNCTION user_follows_maker(p_user_id UUID, p_maker_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM maker_follows 
    WHERE user_id = p_user_id AND maker_id = p_maker_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. UPDATE REVIEWS FOR PURCHASE VERIFICATION
-- ============================================

-- Add columns to track verified purchases
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Function to check if user purchased product (for review verification)
CREATE OR REPLACE FUNCTION user_purchased_product(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.user_id = p_user_id 
      AND oi.product_id = p_product_id
      AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-verify reviews on insert
CREATE OR REPLACE FUNCTION auto_verify_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this user has purchased this product
  IF user_purchased_product(NEW.user_id, NEW.product_id) THEN
    NEW.is_verified_purchase := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS verify_review_on_insert ON reviews;
CREATE TRIGGER verify_review_on_insert
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_verify_review();

-- Seller response to reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS seller_response TEXT,
ADD COLUMN IF NOT EXISTS seller_response_at TIMESTAMP WITH TIME ZONE;

-- Update RLS for reviews to allow insert only if purchased
CREATE POLICY "Users can only review products they purchased"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    user_purchased_product(auth.uid(), product_id)
  );

-- But sellers can respond to any review of their products
CREATE POLICY "Sellers can respond to reviews of their products"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = reviews.product_id AND p.maker_id = (
        SELECT id FROM makers WHERE user_id = auth.uid()
      )
    )
  );

COMMENT ON COLUMN reviews.is_verified_purchase IS 'True if reviewer purchased this product';
COMMENT ON COLUMN reviews.seller_response IS 'Maker/seller response to the review';

-- ============================================
-- 4. RELATED PRODUCTS SUPPORT
-- ============================================

-- Function to get related products (same maker, same category, or random)
CREATE OR REPLACE FUNCTION get_related_products(
  p_product_id UUID,
  p_maker_id UUID,
  p_category_id UUID,
  p_limit INTEGER DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  price DECIMAL(10,2),
  image_url TEXT,
  maker_id UUID,
  maker_name VARCHAR(255),
  category_id UUID,
  relevance_score INTEGER
) AS $$
DECLARE
  v_category_id UUID;
  v_maker_id UUID;
BEGIN
  -- Get the product's category and maker if not provided
  SELECT p.category_id, p.maker_id INTO v_category_id, v_maker_id
  FROM products p WHERE p.id = p_product_id;
  
  RETURN QUERY
  (
    -- Same maker products (highest relevance)
    SELECT 
      p.id, p.name, p.price, p.image_url, p.maker_id, m.name as maker_name,
      p.category_id, 3 as relevance_score
    FROM products p
    JOIN makers m ON p.maker_id = m.id
    WHERE p.maker_id = COALESCE(p_maker_id, v_maker_id)
      AND p.id != p_product_id
      AND p.is_active = true
    LIMIT p_limit / 2
  )
  UNION ALL
  (
    -- Same category products
    SELECT 
      p.id, p.name, p.price, p.image_url, p.maker_id, m.name as maker_name,
      p.category_id, 2 as relevance_score
    FROM products p
    JOIN makers m ON p.maker_id = m.id
    WHERE p.category_id = COALESCE(p_category_id, v_category_id)
      AND p.id != p_product_id
      AND p.is_active = true
      AND p.maker_id != COALESCE(p_maker_id, v_maker_id)
    LIMIT p_limit / 3
  )
  UNION ALL
  (
    -- Random products (fill remaining)
    SELECT 
      p.id, p.name, p.price, p.image_url, p.maker_id, m.name as maker_name,
      p.category_id, 1 as relevance_score
    FROM products p
    JOIN makers m ON p.maker_id = m.id
    WHERE p.id != p_product_id
      AND p.is_active = true
      AND p.maker_id != COALESCE(p_maker_id, v_maker_id)
      AND p.category_id != COALESCE(p_category_id, v_category_id)
    ORDER BY random()
    LIMIT p_limit - (p_limit / 2) - (p_limit / 3)
  )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add badges to makers table (for "Rave reviews", "Smooth dispatch" etc)
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Example badges: ["Rave reviews", "Smooth dispatch", "Star Seller"]
COMMENT ON COLUMN makers.badges IS 'Array of achievement badges (Etsy-style)';
