-- Migration 013: Add slug to categories, fix update_category_counts, add full_name to profiles schema check

-- ============================================
-- STEP 1: Add slug column to categories (if missing)
-- This fixes product detail page 404s
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing categories with slugs based on name
UPDATE categories SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL OR slug = '';

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_categories_slug'
  ) THEN
    CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
  END IF;
END $$;

-- ============================================
-- STEP 2: Fix update_category_counts function (add WHERE clause)
-- ============================================
DROP FUNCTION IF EXISTS public.update_category_counts();

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
  )
  WHERE id IN (SELECT DISTINCT category_id FROM products WHERE is_active = true)
     OR id NOT IN (SELECT DISTINCT category_id FROM products WHERE is_active = true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_category_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_category_counts() TO anon;

-- ============================================
-- STEP 3: Ensure profiles has full_name (not first_name/last_name)
-- This is a schema documentation check — the app now uses full_name
-- ============================================
-- If someone mistakenly added first_name/last_name, drop them
ALTER TABLE profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_name;

-- Ensure full_name exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
