'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackButton } from '@/components/back-button';
import { useSupabase } from '@/lib/use-supabase';

interface ActivityLog {
  id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  post_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

interface UserMap {
  [key: string]: string;
}

export default function ActivityLogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = useSupabase();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id && user.role === 'Admin') {
      loadActivityLogs();
    }
  }, [user?.id, user?.role]);

  const loadActivityLogs = async () => {
    setIsLoading(true);
    try {
      // Fetch all activity logs
      const { data: logs, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // Fetch all users for name mapping
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name');

      if (usersError) throw usersError;

      // Create user map
      const userMapping: UserMap = {};
      users?.forEach((u) => {
        userMapping[u.id] = u.name;
      });
      setUserMap(userMapping);

      // Add user names to activities
      const enrichedActivities = (logs || []).map((log) => ({
        ...log,
        actor_name: userMapping[log.actor_id] || 'Unknown User',
      }));

      setActivities(enrichedActivities);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      submitted_creative: 'Submitted Creative',
      approved_creative: 'Approved Creative',
      returned_creative: 'Returned Creative (Requested Revision)',
      published_creative: 'Published Creative',
      marked_for_update: 'Marked for Update',
      closed_creative: 'Closed Creative',
      submitted_daily_report: 'Submitted Daily Report',
      user_login: 'User Login',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  const getActionColor = (action: string): string => {
    if (action.includes('approved')) return 'bg-green-100 text-green-800 border-green-300';
    if (action.includes('returned') || action.includes('update'))
      return 'bg-orange-100 text-orange-800 border-orange-300';
    if (action.includes('published')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (action.includes('closed')) return 'bg-slate-100 text-slate-800 border-slate-300';
    if (action.includes('submitted')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesAction = !filterAction || activity.action === filterAction;
    const matchesUser =
      !filterUser || activity.actor_id === filterUser;
    return matchesAction && matchesUser;
  });

  const uniqueActions = [...new Set(activities.map((a) => a.action))].sort();
  const uniqueUsers = [...new Set(activities.map((a) => a.actor_id))].sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Activity Log
          </h1>
          <p className="text-slate-600">
            Complete chronological record of all team actions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Action
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {getActionLabel(action)}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by User
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((userId) => (
                  <option key={userId} value={userId}>
                    {userMap[userId] || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 font-semibold">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600">No activities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-600">
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <span className="font-semibold">
                          {activity.actor_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${getActionColor(
                            activity.action
                          )}`}
                        >
                          {getActionLabel(activity.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {activity.details ? (
                          <div className="text-xs">
                            {Object.entries(activity.details).map(
                              ([key, value]) => (
                                <div key={key}>
                                  <span className="font-semibold">
                                    {key}:
                                  </span>{' '}
                                  {String(value)}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!isLoading && filteredActivities.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-600">
                Showing {filteredActivities.length} of {activities.length} total
                activities
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
