-- Migration 025: Add status column to orders table

-- Add status column with proper default and check constraint
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update any NULL statuses to 'pending'
UPDATE public.orders SET status = 'pending' WHERE status IS NULL;

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'));
  END IF;
END $$;

SELECT 'Migration 025 completed successfully' as status;
