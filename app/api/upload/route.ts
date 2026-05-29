import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !postId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique file name
    const timestamp = Date.now();
    const filename = `${postId}/${timestamp}-${file.name}`;

    // Upload to Supabase Storage
    const supabase = getSupabaseClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('creative-uploads')
      .upload(filename, file);

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('creative-uploads')
      .getPublicUrl(filename);

    // Get version number
    const { data: versions } = await supabase
      .from('file_versions')
      .select('version_number', { count: 'exact' })
      .eq('post_id', postId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    // Record file version
    const { data: versionData, error: versionError } = await supabase
      .from('file_versions')
      .insert({
        post_id: postId,
        file_url: urlData.publicUrl,
        version_number: nextVersion,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (versionError) {
      return NextResponse.json(
        { error: versionError.message },
        { status: 400 }
      );
    }

    // Update creative post with latest media URL
    const { data: updatedPost } = await supabase
      .from('creative_posts')
      .update({
        media_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()
      .single();

    // Log activity
    await supabase.from('activity_logs').insert({
      action: `File uploaded (v${nextVersion})`,
      actor_id: userId,
      post_id: postId,
      details: { file_url: urlData.publicUrl, version: nextVersion },
    });

    return NextResponse.json({
      file: versionData,
      publicUrl: urlData.publicUrl,
      version: nextVersion,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
