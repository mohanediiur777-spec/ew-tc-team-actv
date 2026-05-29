import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

// PUT update creative post (approve, return, publish, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, manager_comment, actor_id } = await request.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('creative_posts')
      .update({
        status,
        manager_comment: manager_comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log activity
    const actionMap: Record<string, string> = {
      Approved: 'approved_creative',
      Returned: 'returned_creative',
      Published: 'published_creative',
      'Back for Update': 'marked_for_update',
      Closed: 'closed_creative',
    };

    await supabase.from('activity_logs').insert({
      action: actionMap[status] || `status_changed_to_${status.toLowerCase()}`,
      actor_id,
      post_id: id,
      details: { previous_status: data.status, manager_comment },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('PUT creative error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET single creative post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('creative_posts')
      .select(`
        *,
        users:created_by(id, name, email, role),
        file_versions(id, file_url, version_number, created_at, users:uploaded_by(id, name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET creative error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
