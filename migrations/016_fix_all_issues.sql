-- Migration 016: Fix cart constraint, featured column, and other issues

-- ============================================
-- STEP 1: Add unique constraint for cart_items (fixes ON CONFLICT error)
-- ============================================
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS unique_user_product;

ALTER TABLE cart_items 
ADD CONSTRAINT unique_user_product 
UNIQUE (user_id, product_id);

-- ============================================
-- STEP 2: Add featured column to products
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Set some products as featured for the home page
UPDATE products SET featured = true 
WHERE id IN (
  SELECT id FROM products 
  WHERE is_active = true 
  ORDER BY created_at DESC 
  LIMIT 4
);

-- ============================================
-- STEP 3: Add reviews support for makers
-- ============================================
-- Add review fields to makers table if not exists
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;

-- Create maker_reviews table
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

-- Enable RLS
ALTER TABLE maker_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view maker reviews" 
ON maker_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON maker_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" 
ON maker_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" 
ON maker_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Function to update maker rating
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

-- Trigger for rating updates
DROP TRIGGER IF EXISTS update_maker_rating_trigger ON maker_reviews;
CREATE TRIGGER update_maker_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON maker_reviews
FOR EACH ROW EXECUTE FUNCTION update_maker_rating();

-- ============================================
-- STEP 4: Create maker_applications table for verification flow
-- ============================================
CREATE TABLE IF NOT EXISTS maker_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  maker_id UUID REFERENCES makers(id) ON DELETE CASCADE,
  
  -- Identity verification
  id_verified BOOLEAN DEFAULT false,
  id_verification_method TEXT, -- 'stripe_identity', 'manual', etc.
  id_verification_data JSONB,
  
  -- Phone verification
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  phone_verification_code TEXT,
  phone_verification_expires_at TIMESTAMPTZ,
  
  -- Community guidelines
  guidelines_accepted BOOLEAN DEFAULT false,
  guidelines_accepted_at TIMESTAMPTZ,
  
  -- Application status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE maker_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own application" 
ON maker_applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own application" 
ON maker_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending application" 
ON maker_applications FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin can view all
CREATE POLICY "Admins can view all applications" 
ON maker_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- STEP 5: Fix get_related_products to handle non-UUID inputs gracefully
-- ============================================
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
  -- Try to convert inputs to UUIDs safely
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
  
  -- Return early if product_id is not a valid UUID
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

-- ============================================
-- STEP 6: Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_maker_reviews_maker_id ON maker_reviews(maker_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;

-- ============================================
-- STEP 7: Update existing makers to have slugs
-- ============================================
UPDATE makers 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'),
  '-+', '-', 'g'
)) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- ============================================
-- STEP 8: Fix makers RLS to allow viewing by slug
-- ============================================
DROP POLICY IF EXISTS "Anyone can view makers by slug" ON makers;

CREATE POLICY "Anyone can view verified makers" 
ON makers FOR SELECT 
USING (is_verified = true OR auth.uid() = profile_id);

-- ============================================
-- DONE
-- ============================================
