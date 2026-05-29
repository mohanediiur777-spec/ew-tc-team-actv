-- EW-TC Team ACTV Database Setup

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Creator', 'MediaBuyer', 'Manager')),
  pin TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creative Posts table
CREATE TABLE IF NOT EXISTS public.creative_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Returned', 'Approved', 'Published', 'Back for Update', 'Closed')),
  media_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  internal_note TEXT,
  manager_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Versions table (for version history)
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  version_number INT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Log table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Reports table
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  performance_data JSONB,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submitted_by, report_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_creative_posts_status ON public.creative_posts(status);
CREATE INDEX IF NOT EXISTS idx_creative_posts_created_by ON public.creative_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_logs_post_id ON public.activity_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted_by ON public.daily_reports(submitted_by);

-- Insert default users (to be done manually or via app)
-- INSERT INTO public.users (name, email, role, pin) VALUES
-- ('Hamdi', 'sokare5564@nuitx.com', 'Admin', '1234'),
-- ('Hadeer', 'hadeer@ew-tc.com', 'MediaBuyer', '2345'),
-- ('Bakr', 'bakr@ew-tc.com', 'Creator', '3456'),
-- ('Asmaa', 'asmaa@ew-tc.com', 'Creator', '4567');
