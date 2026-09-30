-- Create storage bucket for product images
-- Run this in Supabase SQL Editor

-- Enable storage (if not already enabled)
-- Note: Buckets are managed via Supabase Storage API, not SQL
-- Go to Supabase Dashboard → Storage → Create bucket named "product-images"
-- Make it public so images can be viewed without auth

-- Alternative: Create bucket via SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Add RLS policy to allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');
