'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSupabase } from '@/lib/use-supabase';

interface CreativePost {
  id: string;
  caption: string;
  media_url: string;
  status: string;
  created_at: string;
  users: { id: string; name: string };
}

export function MediaBuyerDashboard() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [posts, setPosts] = useState<CreativePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('Approved');
  const [updatingPost, setUpdatingPost] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('creative_posts')
        .select(`
          *,
          users:created_by(id, name)
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (postId: string, newStatus: string) => {
    if (!user) return;

    setUpdatingPost(postId);
    try {
      const response = await fetch(`/api/creatives/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Error updating:', err);
      alert('Failed to update post');
    } finally {
      setUpdatingPost(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          My Approved Creatives
        </h2>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['Approved', 'Published', 'Back for Update', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-600">Loading...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900 font-semibold">No Creatives</p>
          <p className="text-blue-700 text-sm mt-1">
            No creatives with status &quot;{filter}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Media Thumbnail */}
              <div className="bg-slate-100 relative">
                {post.media_url && (
                  <>
                    {post.media_url.includes('mp4') ||
                    post.media_url.includes('webm') ? (
                      <div className="aspect-video bg-black flex items-center justify-center">
                        <span className="text-white text-2xl">▶</span>
                      </div>
                    ) : (
                      <img
                        src={post.media_url}
                        alt="Creative"
                        className="aspect-video object-cover w-full"
                      />
                    )}
                  </>
                )}

                {post.status === 'Published' && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full w-3 h-3"></div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-700">
                  By {post.users.name}
                </p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {post.caption}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  {new Date(post.created_at).toLocaleString()}
                </p>

                {/* Action Buttons */}
                {post.status === 'Approved' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updatePostStatus(post.id, 'Published')}
                      disabled={updatingPost === post.id}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                    >
                      ▶ Publish
                    </button>
                    <button
                      onClick={() => updatePostStatus(post.id, 'Back for Update')}
                      disabled={updatingPost === post.id}
                      className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:bg-slate-300 transition-colors"
                    >
                      ⚠ Update
                    </button>
                  </div>
                )}

                {post.status === 'Published' && (
                  <button
                    onClick={() => updatePostStatus(post.id, 'Closed')}
                    disabled={updatingPost === post.id}
                    className="w-full mt-4 bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:bg-slate-300 transition-colors"
                  >
                    ✓ Close Campaign
                  </button>
                )}

                {(post.status === 'Back for Update' || post.status === 'Closed') && (
                  <p className="text-xs text-slate-600 mt-4 text-center">
                    Status: {post.status}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
