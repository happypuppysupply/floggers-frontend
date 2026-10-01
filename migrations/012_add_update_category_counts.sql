-- Migration 012: Add update_category_counts RPC function
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.update_category_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE categories
  SET product_count = (
    SELECT COUNT(*) 
    FROM products 
    WHERE products.category_id = categories.id 
    AND products.is_active = true
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_category_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_category_counts() TO anon;
