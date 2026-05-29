'use client';

import { useAuth } from '@/lib/auth-context';
import { MediaBuyerDashboard } from '@/components/media-buyer-dashboard';
import { BackButton } from '@/components/back-button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MediaBuyerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not MediaBuyer or Admin
    if (user && user.role !== 'MediaBuyer' && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Creative Queue Manager
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Manage approved creatives for publishing
              </p>
            </div>
            <BackButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MediaBuyerDashboard />
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 text-sm">Workflow</h3>
            <p className="text-blue-700 text-xs mt-2">
              Filter by status to view creatives at different stages
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 text-sm">Actions</h3>
            <p className="text-green-700 text-xs mt-2">
              Publish approved creatives or mark for update
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 text-sm">Status</h3>
            <p className="text-purple-700 text-xs mt-2">
              Published: Live on platforms | Closed: Campaign ended
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
