# Supabase Database Setup - Step by Step

## Overview
Your EW-TC ACTV app needs a Supabase database to function. This guide walks you through setting up everything from scratch.

---

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (Supabase URL)
   - **anon public key** (Public API Key)

---

## Step 2: Add Environment Variables

1. In your project root, create or update `.env.local`
2. Add these two lines:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file and restart your dev server (`pnpm dev`)

---

## Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. **Copy ALL of this SQL code** from `SQL_COMPLETE_SCHEMA.sql` in your project:

```sql
-- ============================================================================
-- EW-TC Team ACTV - COMPLETE DATABASE SCHEMA
-- Copy and paste ALL of this into your Supabase SQL Editor
-- ============================================================================

-- 1. USERS TABLE
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
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.creative_posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  version_number INT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BRIEFS TABLE
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
```

4. Click **RUN** (blue button in top right)
5. Wait for "Success" message

---

## Step 4: Add Demo Users (Optional but Recommended)

1. In the same SQL Editor, create a **New Query**
2. Paste this code:

```sql
INSERT INTO public.users (name, email, role, pin) VALUES
('Hamdi', 'sokare5564@nuitx.com', 'Admin', '1234'),
('Hadeer', 'hadeer@ew-tc.com', 'MediaBuyer', '2345'),
('Bakr', 'bakr@ew-tc.com', 'Creator', '3456'),
('Asmaa', 'asmaa@ew-tc.com', 'Creator', '4567')
ON CONFLICT (email) DO NOTHING;
```

3. Click **RUN**
4. You should see "Executed successfully"

---

## Step 5: Create Storage Bucket for File Uploads

1. In Supabase, go to **Storage**
2. Click **Create a new bucket**
3. Name: `creative-uploads`
4. Privacy: **Private** (check the box)
5. Click **Create bucket**

---

## Step 6: Configure Storage Permissions (Row Level Security)

1. In the same Storage page, find `creative-uploads` bucket
2. Click the three dots menu → **Policies**
3. Click **New Policy** → **For authenticated users** → **Create policy**
4. Use template: **SELECT**
5. Paste this in the USING clause:
```sql
auth.uid()::text = (storage.foldername(name))[1]
```
6. Click **Save policy**

7. **Create another policy** for uploads:
   - **Template:** INSERT
   - **Paste in WITH CHECK:**
```sql
auth.role() = 'authenticated'
```
8. Click **Save policy**

---

## Step 7: Test the Connection

1. Go back to your local dev server (http://localhost:3000)
2. Log in with any user (e.g., Hamdi / PIN: 1234)
3. You should see the dashboard without errors
4. Try submitting a creative - it should work!

---

## Troubleshooting

### "No API key found"
- Check that `.env.local` has the correct Supabase credentials
- Restart your dev server after adding `.env.local`

### "Table does not exist"
- Go to SQL Editor and verify all the CREATE TABLE commands ran
- Look for error messages in the execution results

### "Permission denied" on uploads
- Double-check the storage bucket is **Private** (not Public)
- Verify the RLS policies are added for the bucket

### Database is empty after login
- Make sure you ran the full SQL schema
- If you skipped Step 4 (demo users), insert them or create via the app

### "UNIQUE constraint failed on email"
- Users already exist in your database
- Either delete them and try again, or skip Step 4

---

## Database Table Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | Team authentication | id, email, pin, role |
| `creative_posts` | Creative submissions | id, created_by, status, media_url, caption |
| `file_versions` | Version history | id, post_id, file_url, version_number |
| `briefs` | Campaign briefs | id, campaign_name, brief_type, created_by |
| `activity_logs` | Audit trail | id, action, actor_id, post_id, details |
| `daily_reports` | Media buyer reports | id, submitted_by, report_date, campaign_name, current_spend |

---

## Next Steps

✅ Database is now ready
✅ Your app will automatically use it when env vars are set
✅ Hadeer's media buyer dashboard pulls from `creative_posts` with status='Approved'
✅ All activity is logged in `activity_logs`

**You're ready to go live!** 🚀
