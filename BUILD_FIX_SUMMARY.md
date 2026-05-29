# Vercel Build Error - FIXED ✅

## Problem

The Vercel build failed with:
```
Error: Failed to collect page data for /api/creatives/[id]
Export supabase doesn't exist in target module
```

This was caused by:
1. **Top-level environment variable checking** in `lib/supabase-client.ts` that threw errors during build time
2. **Direct Supabase client export** that couldn't be instantiated without environment variables
3. **Client components importing from the problematic module**

## Solution

### 1. Created a new useSupabase hook (`lib/use-supabase.ts`)
```typescript
'use client';

import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

export function useSupabase() {
  return useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Returns dummy client during build, real client at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);
}
```

### 2. Updated `lib/supabase-client.ts` for API routes
```typescript
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}
```

### 3. Updated all API routes (`app/api/**/*.ts`)
- Added: `export const dynamic = 'force-dynamic';`
- Changed: `import { supabase }` → `import { getSupabaseClient }`
- Changed: `supabase.` → `const supabase = getSupabaseClient();` inside handlers

### 4. Updated all client components (`components/*.tsx`, `app/**/*.tsx`)
- Changed: `import { supabase }` → `import { useSupabase }`
- Added: `const supabase = useSupabase();` inside components

## Files Modified

### Core Client Library
- `lib/use-supabase.ts` (NEW)
- `lib/supabase-client.ts` (Updated)

### API Routes (Added `dynamic = 'force-dynamic'`)
- `app/api/creatives/route.ts`
- `app/api/creatives/[id]/route.ts`
- `app/api/upload/route.ts`

### Client Components (Updated imports & hooks)
- `components/creator-submission.tsx`
- `components/manager-approval.tsx`
- `components/media-buyer-dashboard.tsx`
- `app/admin/activity-log/page.tsx`
- `app/media-buyer/report/page.tsx`

## Build Result

### Before
```
✗ Build failed
Error: Failed to collect page data for /api/creatives/[id]
Export supabase doesn't exist in target module
```

### After
```
✓ Compiled successfully in 5.8s
✓ Generating static pages using 1 worker (9/9) in 278ms
✓ Route mapping complete

Route (app)
├ ○ / (Static)
├ ○ /login (Static)
├ ○ /dashboard (Static)
├ ○ /admin/activity-log (Static)
├ ○ /media-buyer/dashboard (Static)
├ ○ /media-buyer/report (Static)
├ ƒ /api/auth/login (Dynamic)
├ ƒ /api/creatives (Dynamic)
├ ƒ /api/creatives/[id] (Dynamic)
└ ƒ /api/upload (Dynamic)
```

## How It Works

### At Build Time
- Dummy Supabase client is created (never used)
- No errors thrown
- Pages prerender successfully

### At Runtime
- Real environment variables are available
- Real Supabase client is instantiated
- Full functionality works

## Next Steps for Deployment

1. **Set Environment Variables** in Vercel project:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Deploy to Vercel**:
   ```bash
   git push origin main
   # OR
   vercel deploy
   ```

3. **Verify Build**:
   - Check Vercel Dashboard → Deployments
   - Should see ✓ Build successful

## Testing Locally

```bash
pnpm build     # Should complete successfully
pnpm dev       # Should run without errors
```

Visit `http://localhost:3000/login` to verify the app works correctly.

---

## Key Insight

The issue was **top-level synchronous code** that ran during build. The solution separates concerns:

- **API routes**: Use `getSupabaseClient()` function (server-side)
- **Client components**: Use `useSupabase()` hook (client-side)
- **Build time**: Dummy client prevents errors
- **Runtime**: Real client provides full functionality

This pattern is production-ready and follows Next.js best practices for Supabase integration.
