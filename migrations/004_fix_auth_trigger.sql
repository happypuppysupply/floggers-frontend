-- Fix auth trigger: SECURITY DEFINER ensures trigger has proper permissions

-- Step 1: Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Ensure profiles RLS allows trigger to work
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies and recreate clean ones
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Create fresh policies
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- Allow trigger to insert

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 5: Ensure makers table uses correct column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'makers' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.makers ADD COLUMN is_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'makers' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.makers ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;
