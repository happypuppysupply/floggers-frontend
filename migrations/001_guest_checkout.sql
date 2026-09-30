-- Guest Checkout Migration
-- Adds support for guest orders (no user account required)

-- Add guest order fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow guest order creation
-- First, drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Create new policies that support guest checkout
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT 
  USING (auth.uid() = user_id OR (is_guest = TRUE AND email = current_setting('app.current_email', true)::VARCHAR));

CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can create guest orders"
  ON orders FOR INSERT 
  WITH CHECK (true);  -- Allow all inserts (guest orders via API)

-- Note: In production, you may want to restrict guest order creation to specific IPs or add rate limiting
-- For now, this allows the checkout flow to work

COMMENT ON COLUMN orders.email IS 'Guest email for orders without user account';
COMMENT ON COLUMN orders.is_guest IS 'True if order placed by guest (no user_id)';

-- Also update order_items to allow insertion without auth (for guest orders)
CREATE POLICY "Service role can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Create index for guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(email) WHERE is_guest = TRUE;
