'use client';

import { useState, useRef } from 'react';
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
  file_versions?: Array<{
    id: string;
    file_url: string;
    version_number: number;
    created_at: string;
  }>;
}

interface CreatorSubmissionProps {
  onSubmitSuccess?: () => void;
}

export function CreatorSubmission({ onSubmitSuccess }: CreatorSubmissionProps) {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [caption, setCaption] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mySubmissions, setMySubmissions] = useState<CreativePost[]>([]);
  const [showMySubmissions, setShowMySubmissions] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!caption.trim() || !file || !user) {
      setError('Please fill in all required fields and select a file');
      return;
    }

    setLoading(true);

    try {
      // Create creative post with proper field naming
      const { data: postData, error: postError } = await supabase
        .from('creative_posts')
        .insert({
          created_by: user.id,
          caption: caption.trim(),
          internal_note: internalNote.trim() || null,
          status: 'Pending',
          media_url: '',
          manager_comment: null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('postId', postData.id);
      formData.append('userId', user.id);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('File upload failed');
      }

      // Log activity for submission
      await supabase.from('activity_logs').insert({
        action: 'submitted_creative',
        actor_id: user.id,
        post_id: postData.id,
        details: {
          caption: caption.substring(0, 100),
          file_name: file.name,
        },
      });

      setSuccess('Creative submitted successfully!');
      setCaption('');
      setInternalNote('');
      setFile(null);
      setPreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onSubmitSuccess?.();
      
      // Refresh my submissions
      loadMySubmissions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit creative'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMySubmissions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('creative_posts')
        .select(
          `
          *,
          file_versions(id, file_url, version_number, created_at)
        `
        )
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMySubmissions(data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    }
  };

  const toggleMySubmissions = () => {
    if (!showMySubmissions) {
      loadMySubmissions();
    }
    setShowMySubmissions(!showMySubmissions);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Approved: 'bg-green-100 text-green-800 border-green-300',
      Returned: 'bg-red-100 text-red-800 border-red-300',
      Published: 'bg-blue-100 text-blue-800 border-blue-300',
      'Back for Update': 'bg-orange-100 text-orange-800 border-orange-300',
      Closed: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Submission Form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Submit New Creative
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Upload Media (Image/Video)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📁</div>
                <p className="font-semibold text-slate-900">
                  {file ? file.name : 'Click to select media'}
                </p>
                {file && (
                  <p className="text-xs text-slate-600 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </button>

            {preview && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Preview:
                </p>
                {file?.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="bg-slate-100 rounded-lg p-4 text-center text-slate-600">
                    Video: {file?.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Caption (Required)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Write a compelling caption for this creative..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {caption.length}/500 characters
            </p>
          </div>

          {/* Internal Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Internal Note (Optional)
            </label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Add any internal notes or context for the manager..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {internalNote.length}/300 characters
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✓ {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !caption.trim() || !file}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              loading || !caption.trim() || !file
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Creative'}
          </button>
        </form>
      </div>

      {/* My Submissions */}
      <div>
        <button
          onClick={toggleMySubmissions}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-4"
        >
          {showMySubmissions ? '▼ Hide' : '▶ View'} My Submissions
        </button>

        {showMySubmissions && (
          <div className="space-y-3">
            {mySubmissions.length === 0 ? (
              <p className="text-slate-600 text-sm">No submissions yet</p>
            ) : (
              mySubmissions.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-2">
                        {post.caption}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>

                  {post.manager_comment && post.status === 'Returned' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-red-900 mb-1">
                        Manager Comment:
                      </p>
                      <p className="text-sm text-red-800">
                        {post.manager_comment}
                      </p>
                    </div>
                  )}

                  {post.file_versions && post.file_versions.length > 0 && (
                    <div className="text-xs text-slate-600">
                      {post.file_versions.length} version
                      {post.file_versions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
