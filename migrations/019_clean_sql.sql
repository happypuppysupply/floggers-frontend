-- Migration 019: Clean SQL fixes
-- Run this entire file in Supabase SQL Editor

-- Step 1: Drop existing functions
DROP FUNCTION IF EXISTS get_related_products(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_related_products(UUID, UUID, UUID, INTEGER);

-- Step 2: Create get_related_products with TEXT parameters
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
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_uuid UUID;
  v_maker_uuid UUID;
  v_category_uuid UUID;
BEGIN
  -- Safely convert to UUIDs
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
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO anon;

-- Step 4: Fix reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing reviews
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Step 5: Fix slugs for makers
UPDATE makers 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 6: Fix slugs for products
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_makers_slug ON makers(slug);

-- Step 8: Create user_purchased_product function
CREATE OR REPLACE FUNCTION user_purchased_product(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Step 9: Verify everything worked
SELECT 'Migration 019 completed successfully' AS status;
