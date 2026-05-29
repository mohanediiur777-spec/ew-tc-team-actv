'use client';

import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

export function useSupabase() {
  return useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return null-safe client if env vars are missing (for build time)
    if (!supabaseUrl || !supabaseAnonKey) {
      // Create a dummy client that won't be used during build
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);
}
