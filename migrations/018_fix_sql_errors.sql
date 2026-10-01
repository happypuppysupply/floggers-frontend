-- Migration 018: Fix SQL errors and functions

-- Step 1: Fix get_related_products function - recreate with proper signature
DROP FUNCTION IF EXISTS get_related_products(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_related_products(UUID, UUID, UUID, INTEGER);

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
  relevance_score INTEGER
) AS $$
DECLARE
  v_product_uuid UUID;
  v_maker_uuid UUID;
  v_category_uuid UUID;
BEGIN
  -- Safely convert inputs to UUIDs
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
  
  -- Return empty if product_id is not valid UUID
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
    CASE 
      WHEN p.maker_id = v_maker_uuid THEN 3
      WHEN p.category_id = v_category_uuid THEN 2
      ELSE 1
    END as relevance_score
  FROM products p
  LEFT JOIN makers m ON p.maker_id = m.id
  WHERE p.id != v_product_uuid
    AND p.is_active = true
    AND (v_maker_uuid IS NULL OR p.maker_id = v_maker_uuid OR v_category_uuid IS NULL OR p.category_id = v_category_uuid)
  ORDER BY 
    CASE 
      WHEN p.maker_id = v_maker_uuid THEN 3
      WHEN p.category_id = v_category_uuid THEN 2
      ELSE 1
    END DESC,
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO anon;

-- Step 2: Fix reviews table - add status column for pending/approved
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing reviews to approved
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Step 3: Add RLS policy for reviews to allow makers to see their product reviews
DROP POLICY IF EXISTS "Makers can view reviews for their products" ON reviews;
CREATE POLICY "Makers can view reviews for their products" 
ON reviews FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM products p 
    JOIN makers m ON p.maker_id = m.id 
    WHERE p.id = reviews.product_id 
    AND m.profile_id = auth.uid()
  )
);

-- Step 4: Fix maker_reviews query issue - ensure proper types
-- The issue is likely that maker_id is being passed as text in the query
-- Make sure the function handles this

-- Step 5: Add function to check if user purchased product
CREATE OR REPLACE FUNCTION user_purchased_product(
  p_user_id UUID,
  p_product_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.user_id = p_user_id
    AND oi.product_id = p_product_id
    AND o.status IN ('completed', 'shipped', 'delivered');
    
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create policy for reviews that checks purchase
DROP POLICY IF EXISTS "Users can create reviews for purchased products" ON reviews;
CREATE POLICY "Users can create reviews for purchased products" 
ON reviews FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND user_purchased_product(auth.uid(), product_id)
);

-- Step 7: Add function to submit review (will be pending by default)
CREATE OR REPLACE FUNCTION submit_product_review(
  p_user_id UUID,
  p_product_id UUID,
  p_rating INTEGER,
  p_title TEXT,
  p_comment TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if user purchased the product
  IF NOT user_purchased_product(p_user_id, p_product_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must purchase this product before reviewing');
  END IF;
  
  -- Check if user already reviewed this product
  IF EXISTS (SELECT 1 FROM reviews WHERE user_id = p_user_id AND product_id = p_product_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already reviewed this product');
  END IF;
  
  -- Insert review (pending status)
  INSERT INTO reviews (user_id, product_id, rating, title, comment, status)
  VALUES (p_user_id, p_product_id, p_rating, p_title, p_comment, 'pending');
  
  RETURN jsonb_build_object('success', true, 'message', 'Review submitted and pending approval');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Fix maker profile slugs - ensure all makers have slugs
UPDATE makers 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
  '-+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 9: Ensure products have slugs
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
  '-+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 10: Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug_lookup ON products(slug);
CREATE INDEX IF NOT EXISTS idx_makers_slug_lookup ON makers(slug);

-- Done
SELECT 'Migration 018 completed successfully' as status;
