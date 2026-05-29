-- ============================================================================
-- EW-TC Team ACTV - COMPLETE DATABASE SCHEMA
-- Copy and paste ALL of this into your Supabase SQL Editor
-- ============================================================================

-- 1. USERS TABLE
-- Stores all team member authentication and role information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Creator' CHECK (role IN ('Admin', 'Creator', 'MediaBuyer', 'Manager')),
  pin TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREATIVE POSTS TABLE (Main Projects/Creatives)
-- Stores all creative submissions with status pipeline
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

-- 3. FILE VERSIONS TABLE
-- Tracks version history of uploaded files
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  version_number INT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BRIEFS TABLE
-- Stores campaign briefs and project information
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  description TEXT,
  brief_type TEXT CHECK (brief_type IN ('Social', 'Video', 'Banner', 'Landing Page', 'Email', 'Other')),
  target_audience TEXT,
  deliverables JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived', 'Completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ACTIVITY LOGS TABLE
-- Comprehensive audit trail of all actions
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  brief_id UUID REFERENCES public.briefs(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DAILY REPORTS TABLE
-- Media buyer weekly/daily reception reports
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  campaign_name TEXT,
  current_spend DECIMAL(12, 2),
  status_update TEXT,
  performance_data JSONB,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submitted_by, report_date)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_creative_posts_status ON public.creative_posts(status);
CREATE INDEX IF NOT EXISTS idx_creative_posts_created_by ON public.creative_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_creative_posts_created_at ON public.creative_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_file_versions_post_id ON public.file_versions(post_id);

CREATE INDEX IF NOT EXISTS idx_briefs_status ON public.briefs(status);
CREATE INDEX IF NOT EXISTS idx_briefs_created_by ON public.briefs(created_by);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_post_id ON public.activity_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_reports_submitted_by ON public.daily_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON public.daily_reports(report_date);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - uncomment to insert demo users)
-- ============================================================================

-- INSERT INTO public.users (name, email, role, pin) VALUES
-- ('Hamdi', 'sokare5564@nuitx.com', 'Admin', '1234'),
-- ('Hadeer', 'hadeer@ew-tc.com', 'MediaBuyer', '2345'),
-- ('Bakr', 'bakr@ew-tc.com', 'Creator', '3456'),
-- ('Asmaa', 'asmaa@ew-tc.com', 'Creator', '4567')
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- STORAGE BUCKET SETUP (Do this in Supabase UI - not SQL)
-- ============================================================================
-- 1. Go to Supabase Dashboard → Storage → Create New Bucket
-- 2. Name: "creative-uploads"
-- 3. Privacy: Private
-- 4. Set the following RLS policy (SQL Editor):
--
-- CREATE POLICY "Allow authenticated users to upload files" 
-- ON storage.objects FOR INSERT 
-- WITH CHECK (auth.role() = 'authenticated');
--
-- CREATE POLICY "Allow users to view their own files" 
-- ON storage.objects FOR SELECT 
-- USING (auth.uid()::text = (storage.foldername(name))[1]);
--
-- ============================================================================
