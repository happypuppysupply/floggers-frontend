-- Migration 015: Fix slugs for existing products/makers and RLS for 406 errors
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Generate slugs for products that don't have them
-- ============================================
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
  '-+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- STEP 2: Generate slugs for makers that don't have them
-- ============================================
UPDATE makers 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
  '-+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- STEP 3: Fix 406 errors - Ensure products can be queried with embedded makers
-- Add explicit RLS policy for public products with maker data
-- ============================================

-- Drop existing if any
DROP POLICY IF EXISTS "Public can view active products with makers" ON products;

-- Create policy that allows viewing active products (needed for embedded selects)
CREATE POLICY "Public can view active products with makers" 
ON products FOR SELECT 
USING (is_active = true);

-- ============================================
-- STEP 4: Ensure makers table has RLS for public viewing
-- ============================================
DROP POLICY IF EXISTS "Public can view verified makers" ON makers;

CREATE POLICY "Public can view verified makers" 
ON makers FOR SELECT 
USING (is_verified = true);

-- ============================================
-- STEP 5: Fix categories RLS
-- ============================================
DROP POLICY IF EXISTS "Public can view categories" ON categories;

CREATE POLICY "Public can view categories" 
ON categories FOR SELECT 
USING (true);

-- ============================================
-- STEP 6: Add indexes for slug lookups (performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_makers_slug ON makers(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- STEP 7: Ensure products have is_active set
-- ============================================
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- ============================================
-- STEP 8: Fix get_related_products function to handle slugs
-- ============================================
CREATE OR REPLACE FUNCTION get_related_products(
  p_product_id UUID,
  p_maker_id UUID,
  p_category_id UUID,
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
BEGIN
  -- Validate inputs
  IF p_product_id IS NULL THEN
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
      WHEN p.maker_id = p_maker_id THEN 3
      WHEN p.category_id = p_category_id THEN 2
      ELSE 1
    END as relevance_score
  FROM products p
  LEFT JOIN makers m ON p.maker_id = m.id
  WHERE p.id != p_product_id
    AND p.is_active = true
    AND (p.maker_id = p_maker_id OR p.category_id = p_category_id)
  ORDER BY 
    CASE 
      WHEN p.maker_id = p_maker_id THEN 3
      WHEN p.category_id = p_category_id THEN 2
      ELSE 1
    END DESC,
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE! Test with:
-- SELECT * FROM get_related_products('your-product-uuid', 'your-maker-uuid', 'your-category-uuid', 6);
-- ============================================
