-- Add missing columns to makers table for shop profile

-- Add email column (for shop contact)
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add website column (already exists in some versions, make sure it's there)
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Add avatar_url for shop logo
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add cover_image_url for shop banner
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add social links
ALTER TABLE makers 
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);

COMMENT ON COLUMN makers.email IS 'Shop contact email (may differ from user email)';
COMMENT ON COLUMN makers.website IS 'External shop website URL';
COMMENT ON COLUMN makers.avatar_url IS 'Shop logo/avatar image URL';
COMMENT ON COLUMN makers.cover_image_url IS 'Shop banner/cover image URL';
COMMENT ON COLUMN makers.instagram IS 'Instagram handle';

-- Function to check if maker profile is complete
CREATE OR REPLACE FUNCTION is_maker_profile_complete(p_maker_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_maker makers%ROWTYPE;
BEGIN
  SELECT * INTO v_maker FROM makers WHERE id = p_maker_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Profile is complete if: name, location, and bio are filled
  RETURN v_maker.name IS NOT NULL 
    AND v_maker.name != ''
    AND v_maker.location IS NOT NULL 
    AND v_maker.location != ''
    AND v_maker.bio IS NOT NULL 
    AND v_maker.bio != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if maker has products
CREATE OR REPLACE FUNCTION maker_has_products(p_maker_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products 
    WHERE maker_id = p_maker_id 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get maker onboarding progress
CREATE OR REPLACE FUNCTION get_maker_onboarding_progress(p_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_maker makers%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO v_maker FROM makers WHERE profile_id = p_profile_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'profile_complete', false,
      'has_products', false,
      'shipping_setup', false,
      'shop_shared', false,
      'progress_percent', 0
    );
  END IF;
  
  result := jsonb_build_object(
    'profile_complete', is_maker_profile_complete(v_maker.id),
    'has_products', maker_has_products(v_maker.id),
    'shipping_setup', v_maker.location IS NOT NULL AND v_maker.location != '',
    'shop_shared', false, -- Track this separately
    'progress_percent', 0
  );
  
  -- Calculate progress
  result := jsonb_set(result, '{progress_percent}', 
    to_jsonb(
      (CASE WHEN (result->>'profile_complete')::boolean THEN 25 ELSE 0 END) +
      (CASE WHEN (result->>'has_products')::boolean THEN 25 ELSE 0 END) +
      (CASE WHEN (result->>'shipping_setup')::boolean THEN 25 ELSE 0 END) +
      (CASE WHEN (result->>'shop_shared')::boolean THEN 25 ELSE 0 END)
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
