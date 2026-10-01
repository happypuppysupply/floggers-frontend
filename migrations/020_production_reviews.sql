-- Migration 020: Production-ready reviews

-- Step 1: Add seller_response columns to reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS seller_response TEXT;

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS seller_response_at TIMESTAMPTZ;

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;

-- Step 2: Update existing reviews
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Step 3: Fix RLS policies for reviews
-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- New policy: Public can only see approved reviews
CREATE POLICY "Public can view approved reviews" 
ON reviews FOR SELECT 
USING (status = 'approved');

-- New policy: Reviewers can see their own reviews regardless of status
CREATE POLICY "Users can view own reviews" 
ON reviews FOR SELECT 
USING (auth.uid() = user_id);

-- New policy: Admins can see all reviews
CREATE POLICY "Admins can view all reviews" 
ON reviews FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- New policy: Makers can see reviews for their products
CREATE POLICY "Makers can view product reviews" 
ON reviews FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM products p 
    JOIN makers m ON p.maker_id = m.id 
    WHERE p.id = reviews.product_id 
    AND m.profile_id = auth.uid()
  )
);

-- Policy for creating reviews
CREATE POLICY "Verified purchasers can create reviews" 
ON reviews FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'pending'
);

-- Policy for updating reviews (for seller responses)
CREATE POLICY "Makers can respond to reviews" 
ON reviews FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM products p 
    JOIN makers m ON p.maker_id = m.id 
    WHERE p.id = reviews.product_id 
    AND m.profile_id = auth.uid()
  )
);

-- Step 4: Add function for checking purchase
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

-- Step 5: Create function to submit review
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
  IF EXISTS (SELECT 1 FROM reviews WHERE user_id = p_user_id AND product_id = p_product_id AND status != 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already reviewed this product');
  END IF;
  
  -- Insert review
  INSERT INTO reviews (user_id, product_id, rating, title, comment, status, is_verified_purchase)
  VALUES (p_user_id, p_product_id, p_rating, p_title, p_comment, 'pending', true);
  
  RETURN jsonb_build_object('success', true, 'message', 'Review submitted and is pending approval');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Add trigger to update product rating when review is approved
CREATE OR REPLACE FUNCTION update_product_rating_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE products 
    SET 
      rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved'),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND status = 'approved')
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating_on_approval();

-- Step 7: Verify
SELECT 'Migration 020 completed: Reviews are production-ready' AS status;
