-- Maker Applications Table
-- For sellers to apply and admins to approve

CREATE TABLE IF NOT EXISTS maker_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  location VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  instagram VARCHAR(255),
  category VARCHAR(100),
  description TEXT NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE maker_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own applications"
  ON maker_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON maker_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON maker_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON maker_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_maker_applications_user ON maker_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_maker_applications_status ON maker_applications(status);

-- Function to approve application and create maker
CREATE OR REPLACE FUNCTION approve_maker_application(p_application_id UUID)
RETURNS UUID AS $$
DECLARE
  v_application maker_applications%ROWTYPE;
  v_maker_id UUID;
BEGIN
  -- Get application
  SELECT * INTO v_application
  FROM maker_applications
  WHERE id = p_application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or not pending';
  END IF;
  
  -- Create maker
  INSERT INTO makers (
    profile_id,
    name,
    slug,
    location,
    description,
    website,
    is_active,
    verified,
    featured
  ) VALUES (
    v_application.user_id,
    v_application.shop_name,
    v_application.slug,
    v_application.location,
    v_application.description,
    v_application.website,
    true,
    false,
    false
  )
  RETURNING id INTO v_maker_id;
  
  -- Update application status
  UPDATE maker_applications
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_application_id;
  
  -- Update user role
  UPDATE profiles
  SET role = 'maker'
  WHERE id = v_application.user_id;
  
  RETURN v_maker_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject application
CREATE OR REPLACE FUNCTION reject_maker_application(
  p_application_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE maker_applications
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    review_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_application_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE maker_applications IS 'Applications for sellers to join the marketplace';
COMMENT ON COLUMN maker_applications.status IS 'pending, approved, or rejected';
