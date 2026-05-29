'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSupabase } from '@/lib/use-supabase';

interface CreativePost {
  id: string;
  caption: string;
  internal_note: string;
  media_url: string;
  status: string;
  manager_comment: string | null;
  created_at: string;
  users: { id: string; name: string; email: string; role: string };
  file_versions?: Array<{
    id: string;
    file_url: string;
    version_number: number;
    created_at: string;
  }>;
}

export function ManagerApproval() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [posts, setPosts] = useState<CreativePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CreativePost | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('creative_posts')
        .select(
          `
          *,
          users:created_by(id, name, email, role),
          file_versions(id, file_url, version_number, created_at)
        `
        )
        .eq('status', 'Pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/creatives/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Approved',
          actor_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      setPosts(posts.filter((p) => p.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      console.error('Error approving:', err);
      alert('Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (postId: string) => {
    if (!user || !revisionComment.trim()) {
      alert('Please add a revision comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/creatives/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Returned',
          manager_comment: revisionComment,
          actor_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to return');

      setPosts(posts.filter((p) => p.id !== postId));
      setSelectedPost(null);
      setRevisionComment('');
    } catch (err) {
      console.error('Error returning:', err);
      alert('Failed to return');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        You don&apos;t have permission to access this section.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Creative Approval Queue
        </h2>
        <p className="text-slate-600">
          {posts.length} pending {posts.length === 1 ? 'creative' : 'creatives'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-600">Loading...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900 font-semibold">No Pending Creatives</p>
          <p className="text-blue-700 text-sm mt-1">
            All creatives have been reviewed!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {post.users.name}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {post.caption}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {selectedPost?.id === post.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {selectedPost?.id === post.id && (
                <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                  {/* Media Preview */}
                  {post.media_url && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Media Preview:
                      </p>
                      {post.media_url.includes('mp4') ||
                      post.media_url.includes('webm') ? (
                        <video
                          src={post.media_url}
                          controls
                          className="w-full max-h-64 rounded-lg bg-black"
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt="Preview"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">
                      Caption:
                    </p>
                    <p className="text-slate-900">{post.caption}</p>
                  </div>

                  {/* Internal Note */}
                  {post.internal_note && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">
                        Creator Note:
                      </p>
                      <p className="text-slate-700 text-sm">
                        {post.internal_note}
                      </p>
                    </div>
                  )}

                  {/* Version History */}
                  {post.file_versions && post.file_versions.length > 1 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Version History:
                      </p>
                      <div className="space-y-1">
                        {post.file_versions
                          .sort(
                            (a, b) =>
                              b.version_number - a.version_number
                          )
                          .map((v) => (
                            <a
                              key={v.id}
                              href={v.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline block"
                            >
                              v{v.version_number} -{' '}
                              {new Date(v.created_at).toLocaleString()}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Revision Comment Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Revision Comment (if returning)
                    </label>
                    <textarea
                      value={revisionComment}
                      onChange={(e) => setRevisionComment(e.target.value)}
                      maxLength={300}
                      rows={3}
                      placeholder="Explain what needs to be changed..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={submitting}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReturn(post.id)}
                      disabled={submitting || !revisionComment.trim()}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-slate-300 transition-colors"
                    >
                      ↻ Return
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
