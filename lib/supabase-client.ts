import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}

export type CreativePost = {
  id: string;
  created_by: string;
  status: 'Pending' | 'Returned' | 'Approved' | 'Published' | 'Back for Update' | 'Closed';
  media_url: string;
  caption: string;
  internal_note: string;
  manager_comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  actor: string;
  post_id: string | null;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
  role: 'Admin' | 'Creator' | 'MediaBuyer' | 'Manager';
  pin: string;
};
