'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreatorSubmission } from '@/components/creator-submission';
import { ManagerApproval } from '@/components/manager-approval';
import { MediaBuyerDashboard } from '@/components/media-buyer-dashboard';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-slate-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Determine default tab based on user role
  const getDefaultTab = () => {
    switch (user.role) {
      case 'Admin':
        return 'approval';
      case 'Creator':
        return 'submission';
      case 'MediaBuyer':
        return 'mediaBuyer';
      default:
        return 'submission';
    }
  };

  if (!activeTab) {
    setActiveTab(getDefaultTab());
  }

  const navItems = [
    { id: 'submission', label: 'Submit Creative', roles: ['Creator', 'Admin'] },
    { id: 'approval', label: 'Approve Queue', roles: ['Admin'] },
    { id: 'mediaBuyer', label: 'My Queue', roles: ['MediaBuyer', 'Admin'], href: '/media-buyer/dashboard' },
    { id: 'reports', label: 'Submit Report', roles: ['MediaBuyer', 'Admin'], href: '/media-buyer/report' },
    { id: 'activityLog', label: 'Activity Log', roles: ['Admin'], href: '/admin/activity-log' },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                EW-TC Team ACTV
              </h1>
              <p className="text-sm text-slate-600">Module 3: Creative Submission & Approval</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-600">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {visibleNavItems.map((item) =>
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  className="py-4 px-1 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === item.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'submission' && (
          <CreatorSubmission
            onSubmitSuccess={() => {
              console.log('[v0] Creative submitted successfully');
            }}
          />
        )}

        {activeTab === 'approval' && <ManagerApproval />}

        {activeTab === 'mediaBuyer' && <MediaBuyerDashboard />}
      </main>
    </div>
  );
}
