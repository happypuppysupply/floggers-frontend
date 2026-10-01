-- Migration 017: Clean SQL fixes
-- Run this in Supabase SQL Editor

-- Step 1: Fix cart constraint
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS unique_user_product;

ALTER TABLE cart_items 
ADD CONSTRAINT unique_user_product 
UNIQUE (user_id, product_id);

-- Step 2: Add featured column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

UPDATE products SET featured = true 
WHERE featured IS NULL AND is_active = true;

-- Step 3: Create maker_reviews table
CREATE TABLE IF NOT EXISTS maker_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  maker_id UUID REFERENCES makers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(maker_id, reviewer_id)
);

-- Step 4: Add review columns to makers
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- Step 5: Enable RLS on maker_reviews
ALTER TABLE maker_reviews ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DROP POLICY IF EXISTS "Anyone can view maker reviews" ON maker_reviews;
CREATE POLICY "Anyone can view maker reviews" 
ON maker_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON maker_reviews;
CREATE POLICY "Authenticated users can create reviews" 
ON maker_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON maker_reviews;
CREATE POLICY "Users can update own reviews" 
ON maker_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON maker_reviews;
CREATE POLICY "Users can delete own reviews" 
ON maker_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Step 7: Create function to update maker rating
CREATE OR REPLACE FUNCTION update_maker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE makers 
  SET 
    review_count = (SELECT COUNT(*) FROM maker_reviews WHERE maker_id = COALESCE(NEW.maker_id, OLD.maker_id)),
    average_rating = COALESCE((SELECT AVG(rating) FROM maker_reviews WHERE maker_id = COALESCE(NEW.maker_id, OLD.maker_id)), 0)
  WHERE id = COALESCE(NEW.maker_id, OLD.maker_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS update_maker_rating_trigger ON maker_reviews;
CREATE TRIGGER update_maker_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON maker_reviews
FOR EACH ROW EXECUTE FUNCTION update_maker_rating();

-- Step 9: Fix get_related_products function to handle non-UUIDs
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
$$ LANGUAGE plpgsql;

-- Step 10: Create indexes
CREATE INDEX IF NOT EXISTS idx_maker_reviews_maker_id ON maker_reviews(maker_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

-- Step 11: Add cover_image_url to makers if not exists
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Done
SELECT 'Migration 017 completed successfully' as status;
