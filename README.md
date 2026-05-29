# EW-TC Team ACTV

**Campaign Operations Hub** — A production-ready internal platform for managing creative submissions, approvals, and campaign operations.

Built for a 4-person marketing team: Hamdi (Manager), Hadeer (Media Buyer), Bakr (Creative), Asmaa (Video).

---

## Features (Module 3: Creative Submission & Approval)

### For Creators (Bakr & Asmaa)
- ✓ **Easy Submissions** — Upload images/videos with captions
- ✓ **Revision Tracking** — See manager feedback and resubmit
- ✓ **Version History** — All uploads timestamped and logged

### For Manager (Hamdi)
- ✓ **Approval Queue** — Review pending creatives one at a time
- ✓ **Feedback System** — Approve or return with revision comments
- ✓ **Audit Trail** — Every action is logged chronologically

### For Media Buyer (Hadeer)
- ✓ **Approved Queue** — See creatives ready to build
- ✓ **Status Management** — Publish, update, or close campaigns
- ✓ **Live Indicators** — Green dot shows which are live on Meta

### For Everyone
- ✓ **4-Digit PIN Login** — No passwords, instant access
- ✓ **File Storage** — Secure uploads to Supabase Storage
- ✓ **Activity Log** — Complete chronological record

---

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

### Test Credentials

| Name   | Email                | PIN  |
|--------|----------------------|------|
| Hamdi  | sokare5564@nuitx.com | 1234 |
| Hadeer | hadeer@ew-tc.com     | 2345 |
| Bakr   | bakr@ew-tc.com       | 3456 |
| Asmaa  | asmaa@ew-tc.com      | 4567 |

---

## Production Setup

### 1. Supabase (Database + Storage)
- Create free account at [supabase.com](https://supabase.com)
- Run SQL schema from `scripts/setup-db.sql`
- Create `creative-uploads` storage bucket
- Get API keys for `.env.local`

### 2. Deploy to Vercel
- Connect GitHub repo
- Add Supabase environment variables
- Deploy with one click

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed steps.

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers, Node.js
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (S3-compatible)
- **Auth:** PIN-based (4 digits), client-side session
- **Deployment:** Vercel

---

## Project Structure

```
app/
├── login/                    # PIN login page
├── dashboard/               # Main dashboard
├── api/
│   ├── auth/login/         # Authentication endpoint
│   ├── creatives/          # CRUD for submissions
│   ├── creatives/[id]/     # Approval & status updates
│   └── upload/             # File upload handler
components/
├── creator-submission.tsx    # Submission form
├── manager-approval.tsx      # Approval queue
└── media-buyer-dashboard.tsx # Media buyer queue
lib/
├── auth-context.tsx         # Auth state management
├── supabase-client.ts       # Supabase client config
└── types.ts                 # TypeScript interfaces
scripts/
└── setup-db.sql            # Database schema
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login
Body: { email: string, pin: string }
Response: { id, name, email, role }
```

### Creatives
```
GET /api/creatives?status=Pending&userId=...
POST /api/creatives { created_by, caption, internal_note }
GET /api/creatives/[id]
PUT /api/creatives/[id] { status, manager_comment, actor_id }
```

### Upload
```
POST /api/upload
FormData: { file, postId, userId }
Response: { file, publicUrl, version }
```

---

## User Roles & Permissions

| Action | Creator | Media Buyer | Manager |
|--------|---------|-------------|---------|
| Submit Creative | ✓ | ✗ | ✓ |
| View Pending Queue | ✗ | ✗ | ✓ |
| Approve Creative | ✗ | ✗ | ✓ |
| Return for Revision | ✗ | ✗ | ✓ |
| View Approved Queue | ✗ | ✓ | ✓ |
| Publish to Live | ✗ | ✓ | ✓ |
| Close Campaign | ✗ | ✓ | ✓ |

---

## Status Pipeline

```
Creator Submits
    ↓
Pending (Manager reviews)
    ├→ Approve → Approved (Hadeer's queue)
    └→ Return → Returned (Creator sees comment, resubmits)
         ↓
    Back to Pending

Once Approved:
Hadeer builds on Meta
    ├→ Publish → Published (green indicator, live)
    ├→ Back for Update (poor results)
    └→ Closed (campaign ended)
```

---

## Environment Variables

```env
# Supabase (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...

# Optional (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
```

---

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format
```

---

## File Upload Details

- **Supported:** Images (PNG, JPG, WebP) and Videos (MP4, WebM)
- **Storage:** Supabase Storage (encrypted, backed by AWS S3)
- **Versions:** Every upload creates a new timestamped version
- **Public URL:** Automatically generated and stored
- **Max Size:** 50MB per file (configurable)

---

## Security Considerations

### Current (Demo Mode)
- PINs stored plain text (for testing)
- No rate limiting on login
- Mock user data in API

### Production Checklist
- [ ] Hash PINs with bcrypt
- [ ] Add rate limiting to `/api/auth/login`
- [ ] Replace mock credentials with Supabase queries
- [ ] Enable Row-Level Security (RLS) on all tables
- [ ] Set up proper storage bucket policies
- [ ] Use HTTPS only (Vercel enforces)
- [ ] Add CORS configuration if needed
- [ ] Implement session timeout
- [ ] Add password reset flow (or PIN reset)

---

## Troubleshooting

### Login fails
- Verify email and PIN are correct
- Check that users exist in Supabase `users` table
- Clear browser cache and try again

### File upload doesn't work
- Ensure `creative-uploads` bucket exists
- Check file size (max 50MB)
- Verify storage policies allow uploads

### App redirects to login
- Session expired (localStorage cleared)
- User not found
- Authentication failed

### Environment variables missing
- Check `.env.local` file
- On Vercel, add in Settings → Environment Variables
- Restart dev server after adding vars

---

## Future Modules

1. **Module 1: Campaign Command Center** — Live CPL dashboard with health indicators
2. **Module 2: Brief Board** — Task assignments and acknowledgments
3. **Module 4: Weekly Reception Report** — Auto-calculate Real CPL
4. **Module 5: Team Status Feed** — Async daily standups

---

## Team

- **Hamdi** — Manager, Admin access
- **Hadeer** — Media Buyer, publishing & campaign management
- **Bakr** — Creative, design submissions
- **Asmaa** — Video, media submissions

---

## Support

For deployment help, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

For bugs or questions, check:
1. Browser console (F12 → Console tab)
2. Terminal output from `pnpm dev`
3. Supabase dashboard → Logs
4. Network tab in DevTools

---

**Version:** 1.0 — Module 3 Complete  
**Built with:** Next.js 16, TypeScript, Supabase  
**Deployment:** Vercel  
**License:** MIT
