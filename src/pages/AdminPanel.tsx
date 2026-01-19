import { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useStatistics, useHealth } from '../hooks/useAdmin';
import { useUsers, UserSummary } from '../hooks/useUsers';
import { adminService } from '../services/adminService';
import styles from './AdminPanel.module.css';

export function AdminPanel() {
  const { statistics, loading: statsLoading, refetch: refetchStats } = useStatistics();
  const { health, loading: healthLoading, refetch: refetchHealth } = useHealth();
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useUsers(1, 100); // Get all users

  const users = usersData?.items || [];
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionMessage, setBulkActionMessage] = useState<string | null>(null);

  // Calculate uptime (mock for POC - in production, track from server start time)
  const [uptime, setUptime] = useState('24h 15m');

  useEffect(() => {
    // Mock uptime calculation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / (1000 * 60 * 60)) + 24;
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60)) + 15;
      setUptime(`${hours}h ${minutes}m`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUserIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedUserIds.size === 0) {
      setBulkActionMessage('Please select at least one user');
      return;
    }

    const confirmMessage = action === 'activate'
      ? `Are you sure you want to activate ${selectedUserIds.size} user(s)?`
      : `Are you sure you want to deactivate ${selectedUserIds.size} user(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setBulkActionLoading(true);
    setBulkActionMessage(null);

    try {
      const result = await adminService.bulkUpdateUserStatus({
        userIds: Array.from(selectedUserIds),
        isActive: action === 'activate',
      });

      setBulkActionMessage(
        `Success: ${result.successCount} user(s) updated. Failed: ${result.failedCount}.`
      );

      if (result.errors.length > 0) {
        console.error('Bulk update errors:', result.errors);
      }

      // Refresh data
      await refetchUsers();
      await refetchStats();
      setSelectedUserIds(new Set());
    } catch (error) {
      setBulkActionMessage(
        `Error: ${error instanceof Error ? error.message : 'Failed to update users'}`
      );
      console.error('Bulk action error:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Healthy: 'bg-green-100 text-green-800',
      Unhealthy: 'bg-red-100 text-red-800',
      Unknown: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.Unknown;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">
              System management and administration
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              refetchHealth();
              refetchStats();
            }}
          >
            🔄 Refresh All
          </Button>
        </div>

        {/* System Health Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">System Health</h2>
          <div className={styles.gridContainer}>
            {/* API Status Card */}
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="text-sm font-medium text-gray-500">API Status</h3>
                {healthLoading ? (
                  <p className="text-lg font-semibold text-gray-400 mt-2">Loading...</p>
                ) : (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        health?.apiStatus || 'Unknown'
                      )}`}
                    >
                      {health?.apiStatus || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Database Status Card */}
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">💾</div>
                <h3 className="text-sm font-medium text-gray-500">Database Status</h3>
                {healthLoading ? (
                  <p className="text-lg font-semibold text-gray-400 mt-2">Loading...</p>
                ) : (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        health?.databaseStatus || 'Unknown'
                      )}`}
                    >
                      {health?.databaseStatus || 'Unknown'}
                    </span>
                    {health?.databaseError && (
                      <p className="text-xs text-red-600 mt-1">{health.databaseError}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Uptime Card */}
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{uptime}</p>
              </div>
            </Card>

            {/* Active Sessions Card (Mock) */}
            <Card>
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {statistics?.activeUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active users</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Statistics Dashboard Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Statistics Dashboard</h2>
          {statsLoading ? (
            <p className="text-gray-500">Loading statistics...</p>
          ) : (
            <div className={styles.gridContainer}>
              {/* Users Stats Card */}
              <Card>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Users</h3>
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-3">
                    {statistics?.totalUsers || 0}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium text-green-600">
                        {statistics?.activeUsers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inactive:</span>
                      <span className="font-medium text-gray-500">
                        {statistics?.inactiveUsers || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Courses Stats Card */}
              <Card>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Courses</h3>
                    <span className="text-2xl">📚</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-3">
                    {statistics?.totalCourses || 0}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required:</span>
                      <span className="font-medium text-red-600">
                        {statistics?.requiredCourses || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optional:</span>
                      <span className="font-medium text-blue-600">
                        {statistics?.optionalCourses || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enrollments Stats Card */}
              <Card>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Enrollments</h3>
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-3">
                    {statistics?.totalEnrollments || 0}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {statistics?.pendingEnrollments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium text-blue-600">
                        {statistics?.activeEnrollments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium text-green-600">
                        {statistics?.completedEnrollments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelled:</span>
                      <span className="font-medium text-red-600">
                        {statistics?.cancelledEnrollments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Completion Rate Card */}
              <Card>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-3">
                    {statistics?.completionRate?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics?.completedEnrollments || 0} of {statistics?.totalEnrollments || 0}{' '}
                    enrollments completed
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Bulk User Operations Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Bulk User Operations</h2>
          <Card>
            {usersLoading ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <div>
                {/* Bulk Action Controls */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {selectedUserIds.size} user(s) selected
                    </span>
                    {selectedUserIds.size > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleBulkAction('activate')}
                          disabled={bulkActionLoading}
                        >
                          {bulkActionLoading ? 'Processing...' : '✅ Activate Selected'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleBulkAction('deactivate')}
                          disabled={bulkActionLoading}
                        >
                          {bulkActionLoading ? 'Processing...' : '❌ Deactivate Selected'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bulk Action Message */}
                {bulkActionMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md text-sm ${
                      bulkActionMessage.startsWith('Success')
                        ? 'bg-green-50 text-green-800'
                        : bulkActionMessage.startsWith('Error')
                        ? 'bg-red-50 text-red-800'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    {bulkActionMessage}
                  </div>
                )}

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.size === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: UserSummary) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 ${
                            selectedUserIds.has(user.id) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.has(user.id)}
                              onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(user.createdUtc).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No users found</div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
