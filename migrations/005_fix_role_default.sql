-- EMERGENCY FIX: Force correct role handling

-- Step 1: Check current state
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Step 2: Force drop the wrong default and set correct one
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'buyer';

-- Step 3: Drop ALL existing triggers on auth.users
DO $$
DECLARE
  trg RECORD;
BEGIN
  FOR trg IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trg.tgname);
  END LOOP;
END $$;

-- Step 4: Drop function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 5: Create fresh function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, full_name, avatar_url, role, created_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    'buyer',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create fresh trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Verify
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
