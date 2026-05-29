'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/back-button';
import { useSupabase } from '@/lib/use-supabase';

interface Report {
  id: string;
  campaign_name: string;
  current_spend: number;
  daily_status: string;
  created_at: string;
  updated_at: string;
}

export default function MediaBuyerReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = useSupabase();
  const [campaignName, setCampaignName] = useState('');
  const [currentSpend, setCurrentSpend] = useState('');
  const [dailyStatus, setDailyStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'MediaBuyer')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id) {
      loadReports();
    }
  }, [user?.id]);

  const loadReports = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!campaignName.trim() || !currentSpend || !dailyStatus.trim() || !user) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('daily_reports')
        .insert({
          submitted_by: user.id,
          campaign_name: campaignName.trim(),
          current_spend: parseFloat(currentSpend),
          daily_status: dailyStatus.trim(),
          report_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) throw insertError;

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'submitted_daily_report',
        actor_id: user.id,
        details: {
          campaign_name: campaignName,
          spend: currentSpend,
        },
      });

      setSuccess('Report submitted successfully!');
      setCampaignName('');
      setCurrentSpend('');
      setDailyStatus('');
      loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'MediaBuyer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Weekly Reception Report
          </h1>
          <p className="text-slate-600">
            Submit your daily campaign spend and performance status
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Campaign Name (Required)
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Product Launch Q2 2026"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Current Spend */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current Spend (USD) (Required)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentSpend}
                  onChange={(e) => setCurrentSpend(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Daily Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Daily Status Update (Required)
              </label>
              <textarea
                value={dailyStatus}
                onChange={(e) => setDailyStatus(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Describe today's campaign performance, any issues, and key metrics..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                {dailyStatus.length}/1000 characters
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
              disabled={isSubmitting || !campaignName.trim() || !currentSpend || !dailyStatus.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                isSubmitting || !campaignName.trim() || !currentSpend || !dailyStatus.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* Previous Reports */}
        <div>
          <button
            onClick={() => setShowReports(!showReports)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-4"
          >
            {showReports ? '▼ Hide' : '▶ View'} Previous Reports ({reports.length})
          </button>

          {showReports && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              {reports.length === 0 ? (
                <p className="text-slate-600 text-sm">No reports submitted yet</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {report.campaign_name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          ${report.current_spend.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {report.daily_status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
