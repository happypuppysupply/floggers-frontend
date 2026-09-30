-- Fix missing columns and RLS policies

-- Add active column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow public to view basic profile info (for makers)
CREATE POLICY "Public can view maker profiles"
  ON profiles FOR SELECT
  USING (true);

-- Fix maker_applications RLS
ALTER TABLE maker_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON maker_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON maker_applications;

CREATE POLICY "Users can view own applications"
  ON maker_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON maker_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure categories has proper columns
ALTER TABLE categories ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;

-- Update product_count trigger
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_count ON products;
CREATE TRIGGER update_category_count
AFTER INSERT OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- Seed categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
  ('floggers', 'Floggers', 'floggers', 'Handcrafted leather floggers and whips', 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=400&h=300&fit=crop'),
  ('paddles', 'Paddles', 'paddles', 'Impact paddles in various materials', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop'),
  ('crops', 'Crops & Canes', 'crops-canes', 'Riding crops and canes', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop'),
  ('restraints', 'Restraints', 'restraints', 'Cuffs, ropes, and bondage gear', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'),
  ('collars', 'Collars', 'collars', 'Collars and leashes', 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=400&h=300&fit=crop'),
  ('accessories', 'Accessories', 'accessories', 'Additional BDSM accessories', 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&h=300&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Seed makers
INSERT INTO makers (id, name, slug, description, bio, location, rating, image_url, verified, featured) VALUES
  ('maker-1', 'Black Raven Leather', 'black-raven-leather', 'Artisan leather floggers hand-crafted in Portland', 'Founded in 2018, Black Raven Leather specializes in premium BDSM floggers and impact toys crafted from full-grain Italian leather.', 'Portland, OR', 4.9, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', true, true),
  ('maker-2', 'Iron Heart Forge', 'iron-heart-forge', 'Steel and fire, forged for play', 'A metalworking collective creating heavy-duty restraints, spreader bars, and custom dungeon furniture.', 'Detroit, MI', 4.8, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', true, true),
  ('maker-3', 'Velvet Noose Ropeworks', 'velvet-noose-ropeworks', 'Japanese-inspired rope in silk and jute', 'Specializing in Shibari-grade jute and silk ropes, Velvet Noose sources ethically-produced natural fibers.', 'San Francisco, CA', 4.9, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face', true, false),
  ('maker-4', 'Crimson Crest Designs', 'crimson-crest-designs', 'Bold collars for bold statements', 'A woman-owned studio creating statement collars and day collars that blur the line between kink and fashion.', 'Austin, TX', 4.7, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face', true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed products
INSERT INTO products (id, maker_id, category_id, name, slug, description, price, rating, review_count, images, materials, badge, featured, active) VALUES
  ('prod-1', 'maker-1', 'floggers', 'The Penumbra Flogger', 'the-penumbra-flogger', 'A 24-tailed deer hide flogger with a weighted oak handle.', 185.00, 4.9, 47, '["https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop"]', '["Full-grain Italian leather", "Oak handle", "Brass hardware"]', 'Bestseller', true, true),
  ('prod-2', 'maker-1', 'floggers', 'Midnight Mini Flogger', 'midnight-mini-flogger', 'Compact 12-tailed flogger perfect for travel.', 95.00, 4.7, 28, '["https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&h=600&fit=crop"]', '["Latigo leather", "Walnut handle"]', null, false, true),
  ('prod-3', 'maker-2', 'restraints', 'Abyss Wrist Cuffs', 'abyss-wrist-cuffs', 'Heavy-duty leather wrist cuffs with locking buckle.', 72.00, 4.8, 38, '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"]', '["4oz latigo leather", "Suede lining", "Nickel-plated hardware"]', null, true, true),
  ('prod-4', 'maker-4', 'collars', 'The Sovereign Collar', 'the-sovereign-collar', 'A statement collar in deep burgundy leather.', 68.00, 4.9, 32, '["https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop"]', '["Full-grain leather", "Locking clasp"]', 'Featured', true, true),
  ('prod-5', 'maker-2', 'paddles', 'Ironwood Spanking Paddle', 'ironwood-spanking-paddle', 'Solid maple paddle with leather-wrapped handle.', 55.00, 4.6, 19, '["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&h=600&fit=crop"]', '["Hard maple", "Leather wrap"]', null, false, true),
  ('prod-6', 'maker-3', 'restraints', 'Shibari Jute Rope Set', 'shibari-jute-rope-set', 'Six 8-meter jute ropes, singed and conditioned.', 89.00, 4.9, 42, '["https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=600&fit=crop"]', '["Japanese jute", "Natural oils"]', 'Top Rated', true, true),
  ('prod-7', 'maker-1', 'floggers', 'Phoenix Tail Flogger', 'phoenix-tail-flogger', 'A dramatic 36-tailed flogger with graduated lengths.', 245.00, 5.0, 15, '["https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=600&fit=crop"]', '["Premium suede", "Brass handle"]', 'Premium', true, true),
  ('prod-8', 'maker-4', 'collars', 'Day Collar - Minimalist', 'day-collar-minimalist', 'Subtle enough for daily wear, beautiful enough for play.', 45.00, 4.5, 56, '["https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=600&h=600&fit=crop"]', '["Vegan leather", "Magnetic clasp"]', null, false, true)
ON CONFLICT (id) DO NOTHING;

-- Update category counts
UPDATE categories SET product_count = (
  SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND products.active = true
);
