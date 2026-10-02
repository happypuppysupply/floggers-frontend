-- Migration 024: Add sales_count to makers table + create maker_reviews table

-- 1. Add sales_count column to makers table (for verified purchase tracking)
ALTER TABLE public.makers
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. Create trigger to auto-update sales_count when order_items are created
CREATE OR REPLACE FUNCTION increment_maker_sales()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.makers
  SET sales_count = COALESCE(sales_count, 0) + 1
  WHERE id = (
    SELECT maker_id FROM public.products WHERE id = NEW.product_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_maker_sales ON public.order_items;
CREATE TRIGGER trg_increment_maker_sales
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION increment_maker_sales();

-- 3. Recalculate existing sales counts
UPDATE public.makers m
SET sales_count = COALESCE((
  SELECT COUNT(*)
  FROM public.order_items oi
  JOIN public.products p ON oi.product_id = p.id
  WHERE p.maker_id = m.id
), 0);

-- 4. Create maker_reviews table (optional - if you want dedicated maker reviews separate from product reviews)
CREATE TABLE IF NOT EXISTS public.maker_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES public.makers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.maker_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved maker reviews"
  ON public.maker_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create maker reviews"
  ON public.maker_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maker reviews"
  ON public.maker_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_maker_reviews_maker ON public.maker_reviews(maker_id);
CREATE INDEX IF NOT EXISTS idx_maker_reviews_user ON public.maker_reviews(user_id);

SELECT 'Migration 024 completed successfully' as status;