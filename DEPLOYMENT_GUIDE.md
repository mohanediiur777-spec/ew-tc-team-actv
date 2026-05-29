# EW-TC Team ACTV — Deployment & Setup Guide

## Overview

**EW-TC Team ACTV** is a production-grade campaign operations platform built for a 4-person marketing team using Next.js, TypeScript, and Supabase.

### Current Status: Module 3 Complete ✓
- ✓ 4-Digit PIN Authentication (no passwords)
- ✓ Creator Interface: Creative Submission with File Uploads
- ✓ Manager Interface: Approval Queue with Revision Comments
- ✓ Media Buyer Interface: Approved Creatives Dashboard
- ✓ Activity Logging System
- ✓ File Version History

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (free tier sufficient)

### 1. Installation

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

The app runs on `http://localhost:3000`

### 2. Demo Login (Testing)

Use any of these credentials:

| Name   | Email                  | PIN  | Role       |
|--------|------------------------|------|------------|
| Hamdi  | sokare5564@nuitx.com   | 1234 | Admin      |
| Hadeer | hadeer@ew-tc.com       | 2345 | MediaBuyer |
| Bakr   | bakr@ew-tc.com         | 3456 | Creator    |
| Asmaa  | asmaa@ew-tc.com        | 4567 | Creator    |

---

## Supabase Setup (Required for Production)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with `sokare5564@nuitx.com`
3. Create a new project (any region)
4. Wait for project initialization

### 2. Create Database Tables

Open the **SQL Editor** in your Supabase dashboard and run the script at:
```
/scripts/setup-db.sql
```

This creates:
- `users` table (4-digit PIN auth)
- `creative_posts` table (submissions with status pipeline)
- `file_versions` table (version history tracking)
- `activity_logs` table (audit trail)
- `daily_reports` table (for future modules)

### 3. Insert Users

In the SQL Editor, run:

```sql
INSERT INTO public.users (name, email, role, pin) VALUES
('Hamdi', 'sokare5564@nuitx.com', 'Admin', '1234'),
('Hadeer', 'hadeer@ew-tc.com', 'MediaBuyer', '2345'),
('Bakr', 'bakr@ew-tc.com', 'Creator', '3456'),
('Asmaa', 'asmaa@ew-tc.com', 'Creator', '4567');
```

### 4. Create Storage Bucket

1. Go to **Storage** in the sidebar
2. Click **Create a new bucket**
3. Name it: `creative-uploads`
4. Leave as **Private**
5. Click **Create bucket**

### 5. Enable Bucket Policies (Optional for Demo)

For production, set proper RLS. For now, test policies are:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'creative-uploads');

-- Allow users to view their files
CREATE POLICY "Allow downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'creative-uploads');
```

### 6. Get Environment Variables

Go to **Project Settings → API** and copy:

```
NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

These are already configured in your project (check `.env.local` if needed).

---

## Deployment to Vercel

### 1. Connect GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Module 3 - Creative Submission & Approval"
git remote add origin https://github.com/<your-username>/ew-tc-actv.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Set **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Your app will be live at `https://ew-tc-actv.vercel.app` (or custom domain)

---

## System Architecture

### Authentication Flow
- **Login Page** (`/login`) — PIN entry (4 digits)
- **Auth Context** (`lib/auth-context.tsx`) — Client-side session management
- **API Route** (`/api/auth/login`) — Validates PIN against database

### Role-Based Features

#### Creator (Bakr, Asmaa)
- **Tab:** Submit Creative
- **Features:**
  - Upload image/video files
  - Add caption (required, 500 char max)
  - Internal note (optional)
  - View submission history
  - See manager feedback when status = "Returned"

#### Media Buyer (Hadeer)
- **Tab:** My Queue
- **Features:**
  - View all "Approved" creatives ready to build
  - Publish to "Published" (goes live on Meta)
  - Mark "Back for Update" if results are poor
  - Close campaigns with "Closed"
  - Filter by status

#### Manager (Hamdi)
- **Tabs:** Submit Creative + Approve Queue + My Queue
- **Features:**
  - Review pending submissions in approval queue
  - **Approve** → moves creative to "Approved" (visible to Hadeer)
  - **Return** → requires comment, goes to "Returned" (visible to creator)
  - Fallback access to all other roles
  - View activity log (future module)

### Status Pipeline

```
Creator submits
        ↓
    Pending (in approval queue)
        ↓
    [Manager Decision]
        ├→ Approve → Approved (visible to Hadeer)
        └→ Return → Returned (creator sees comment, can edit & resubmit)
            ↓
        Back to Pending
        ↓
    [Once Approved]
    Hadeer sees in "My Queue"
        ├→ Publish → Published (green indicator, live on Meta)
        ├→ Back for Update (results are poor)
        └→ Closed (campaign ended)
```

### File Upload & Version History

- Files stored in **Supabase Storage** (`creative-uploads/`)
- Each upload creates a new **version record**
- Users can see all previous versions with timestamps
- Version history is immutable (audit trail)

### Activity Logging

Every action is logged:
- Creative submitted
- Creative approved/returned
- File uploaded (with version number)
- Status changed
- Comments added

This audit trail is queryable and forms the basis of the Activity Log page (Module 5).

---

## Database Schema

### users
```sql
id (UUID)
name (TEXT)
email (TEXT, UNIQUE)
role (ENUM: Admin, Creator, MediaBuyer, Manager)
pin (TEXT)
created_at, updated_at
```

### creative_posts
```sql
id (UUID)
created_by (UUID → users.id)
status (ENUM: Pending, Returned, Approved, Published, Back for Update, Closed)
media_url (TEXT) — latest file URL
caption (TEXT)
internal_note (TEXT)
manager_comment (TEXT) — only when Returned
created_at, updated_at
```

### file_versions
```sql
id (UUID)
post_id (UUID → creative_posts.id)
file_url (TEXT)
version_number (INT)
uploaded_by (UUID → users.id)
created_at
```

### activity_logs
```sql
id (UUID)
action (TEXT)
actor_id (UUID → users.id)
post_id (UUID → creative_posts.id, nullable)
details (JSONB)
created_at
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login with email + PIN

### Creatives
- `GET /api/creatives` — List creatives (filter by status, userId)
- `GET /api/creatives/[id]` — Get single creative with versions
- `POST /api/creatives` — Create new creative post
- `PUT /api/creatives/[id]` — Update status, add manager comment

### Uploads
- `POST /api/upload` — Upload file, create version record

---

## Future Modules (Planned)

### Module 1: Campaign Command Center
Dashboard with live CPL health (green/amber/red) based on PDF thresholds

### Module 2: Brief Board
Task assignments with deadlines and acknowledgment flow

### Module 4: Weekly Reception Report
Auto-calculate Real CPL from weekly channel data

### Module 5: Team Status Feed
Async daily standups (3 questions per person)

---

## Troubleshooting

### "Invalid PIN or login failed"
- Check PIN matches the table (default: 1234, 2345, 3456, 4567)
- Verify email is correct (case-sensitive)
- Check that users were inserted into Supabase

### File upload fails
- Ensure `creative-uploads` bucket exists and is private
- Check Supabase storage policies
- Verify file is under 50MB

### Redirected back to login
- LocalStorage session may have expired
- Clear browser cache and re-login

### "Missing Supabase environment variables"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- On Vercel, add these in **Settings → Environment Variables**

---

## Security Notes

For production:
1. **Remove mock credentials** from `/app/login/page.tsx` after Supabase is live
2. **Enable RLS** on all tables in Supabase
3. **Use HTTPS only** (Vercel enforces this)
4. **Rate limit** the login endpoint (currently unlimited)
5. **Hash PINs** before storing in database (currently plain text for demo)
6. **Set up CORS** if API will be called from external apps

---

## Support & Maintenance

For questions or bugs:
1. Check console logs: `pnpm dev` output
2. Check Supabase logs in dashboard
3. Verify network requests in browser DevTools

---

**Version:** 1.0 (Module 3 Complete)  
**Last Updated:** May 26, 2026  
**Team:** Hamdi (Admin), Hadeer (Media Buyer), Bakr (Creator), Asmaa (Creator)
