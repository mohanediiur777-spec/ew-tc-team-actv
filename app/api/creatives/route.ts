import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

// GET all creative posts or filter by status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const supabase = getSupabaseClient();

    let query = supabase
      .from('creative_posts')
      .select(`
        *,
        users:created_by(id, name, email, role),
        file_versions(id, file_url, version_number, created_at)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET creatives error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new creative post
export async function POST(request: NextRequest) {
  try {
    const { created_by, caption, internal_note } = await request.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('creative_posts')
      .insert({
        created_by,
        caption,
        internal_note,
        status: 'Pending',
        media_url: '', // Will be updated with upload
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      action: 'Creative submitted',
      actor_id: created_by,
      post_id: data.id,
      details: { caption, internal_note },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('POST creative error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
