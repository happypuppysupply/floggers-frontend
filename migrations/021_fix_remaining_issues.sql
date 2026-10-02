-- Migration 021: Fix remaining issues from logs

-- Step 1: Add maker_id to payouts table if missing
ALTER TABLE payouts 
ADD COLUMN IF NOT EXISTS maker_id UUID REFERENCES makers(id);

-- Step 2: Fix maker_applications if missing columns
ALTER TABLE maker_applications 
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_verification_method TEXT,
ADD COLUMN IF NOT EXISTS id_verification_data JSONB,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code TEXT,
ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS guidelines_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guidelines_accepted_at TIMESTAMPTZ;

-- Step 3: Fix get_related_products function - ensure it works properly
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
  relevance_score INTEGER
)
LANGUAGE plpgsql
AS $$
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
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_related_products(TEXT, TEXT, TEXT, INTEGER) TO anon;

-- Step 4: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

-- Step 5: Ensure all products have slugs
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 6: Ensure all makers have slugs
UPDATE makers 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Step 7: Add AI bot user to auth.users if not exists (for conversation FK)
INSERT INTO auth.users (
  id, email, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'bot@floggers.com',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Floggers Assistant"}',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Add AI bot profile
INSERT INTO profiles (
  id, full_name, email, role, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Floggers Assistant',
  'bot@floggers.com',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Migration 021 completed' AS status;
