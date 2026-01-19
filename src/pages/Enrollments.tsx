import React, { useMemo, useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useEnrollments } from '../hooks/useEnrollments';
import { useCourses } from '../hooks/useCourses';
import { useUsers } from '../hooks/useUsers';
import { api } from '../services/api';

interface EnrollmentRow {
  id: string;
  courseId: string;
  courseName: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}

/**
 * Enrollments management page
 * Displays all enrollments with enriched course and user data
 */
export function Enrollments() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: enrollmentsData, loading: loadingEnrollments, error, refetch } = useEnrollments(page, pageSize);
  const { data: coursesData, loading: loadingCourses } = useCourses({ page: 1, pageSize: 100 });
  const { data: usersData, loading: loadingUsers } = useUsers(1, 100);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ userId: '', courseId: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loading = loadingEnrollments || loadingCourses || loadingUsers;

  // Create lookup maps for enrichment
  const courseMap = useMemo(() => {
    if (!coursesData?.items) return new Map();
    return new Map(coursesData.items.map(c => [c.id, c]));
  }, [coursesData]);

  const userMap = useMemo(() => {
    if (!usersData?.items) return new Map();
    return new Map(usersData.items.map(u => [u.id, u]));
  }, [usersData]);

  // Transform and enrich API data
  const data: EnrollmentRow[] = useMemo(() => {
    if (!enrollmentsData?.items) return [];
    
    return enrollmentsData.items.map(enrollment => {
      const course = courseMap.get(enrollment.courseId);
      const user = userMap.get(enrollment.userId);
      
      return {
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseName: course?.title || 'Unknown Course',
        userId: enrollment.userId,
        userEmail: user?.email || 'Unknown',
        userFullName: user?.fullName || 'Unknown User',
        status: enrollment.status,
        enrolledUtc: enrollment.enrolledUtc,
        completedUtc: enrollment.completedUtc
      };
    });
  }, [enrollmentsData, courseMap, userMap]);

  // Status color mapping
  const getStatusTone = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED':
        return 'success';
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'info';
      case 'DROPPED':
      case 'WITHDRAWN':
      case 'CANCELLED':
        return 'warning';
      case 'FAILED':
      case 'EXPIRED':
        return 'danger';
      default:
        return 'info';
    }
  };

  const handleCreateEnrollment = () => {
    setShowCreateModal(true);
    setCreateForm({ userId: '', courseId: '' });
    setCreateError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      await api.post('/api/enrollments', {
        userId: createForm.userId,
        courseId: createForm.courseId
      });
      setShowCreateModal(false);
      refetch();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create enrollment';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Mark this enrollment as completed?')) return;

    try {
      await api.patch(`/api/enrollments/${enrollmentId}/status`, {
        status: 'COMPLETED'
      });
      refetch();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to complete enrollment';
      alert(`Error: ${message}`);
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (!confirm('Cancel this enrollment?')) return;

    try {
      await api.patch(`/api/enrollments/${enrollmentId}/status`, {
        status: 'CANCELLED'
      });
      refetch();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to cancel enrollment';
      alert(`Error: ${message}`);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) return;

    setIsDeleting(enrollmentId);
    try {
      await api.delete(`/api/enrollments/${enrollmentId}`);
      refetch();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete enrollment';
      alert(`Error: ${message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        id: 'user',
        header: 'User',
        accessor: (r: EnrollmentRow) => (
          <div>
            <div style={{ fontWeight: 500 }}>{r.userFullName}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{r.userEmail}</div>
          </div>
        )
      },
      {
        id: 'course',
        header: 'Course',
        accessor: (r: EnrollmentRow) => r.courseName
      },
      {
        id: 'status',
        header: 'Status',
        accessor: (r: EnrollmentRow) => (
          <StatusBadge tone={getStatusTone(r.status)}>
            {r.status}
          </StatusBadge>
        )
      },
      {
        id: 'enrolled',
        header: 'Enrolled Date',
        accessor: (r: EnrollmentRow) => new Date(r.enrolledUtc).toLocaleDateString()
      },
      {
        id: 'completed',
        header: 'Completed Date',
        accessor: (r: EnrollmentRow) => 
          r.completedUtc ? new Date(r.completedUtc).toLocaleDateString() : '—'
      },
      {
        id: 'actions',
        header: 'Actions',
        accessor: (r: EnrollmentRow) => (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(r.status.toUpperCase() === 'ACTIVE' || r.status.toUpperCase() === 'PENDING') && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleCompleteEnrollment(r.id)}
                  aria-label={`Mark as complete`}
                >
                  Complete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleCancelEnrollment(r.id)}
                  aria-label={`Cancel enrollment`}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => handleDeleteEnrollment(r.id)}
              disabled={isDeleting === r.id}
              aria-label={`Delete enrollment`}
            >
              {isDeleting === r.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )
      }
    ],
    [isDeleting]
  );

  if (error) {
    return (
      <Layout>
        <div>
          <h1>Enrollments</h1>
          <Card>
            <p style={{ color: 'red' }}>Error loading enrollments: {error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Enrollments</h1>
          <Button variant="primary" onClick={handleCreateEnrollment}>
            + Create Enrollment
          </Button>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Total Enrollments
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {enrollmentsData?.totalCount || 0}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Active
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {data.filter(e => e.status.toUpperCase() === 'ACTIVE' || e.status.toUpperCase() === 'PENDING').length}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Completed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {data.filter(e => e.status.toUpperCase() === 'COMPLETED').length}
              </div>
            </div>
          </Card>
        </div>

        <Card title="All Enrollments">
          {loading ? (
            <p>Loading enrollments...</p>
          ) : data.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No enrollments found. Create your first enrollment to get started.
            </p>
          ) : (
            <>
              <Table
                caption="Course Enrollments"
                columns={columns}
                data={data}
              />
              
              {/* Pagination controls */}
              {enrollmentsData && enrollmentsData.totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '1rem',
                  padding: '1rem'
                }}>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {enrollmentsData.totalPages} ({enrollmentsData.totalCount} total)
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.min(enrollmentsData.totalPages, p + 1))}
                    disabled={page === enrollmentsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Create Enrollment Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Create New Enrollment</h2>
            
            {createError && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '0.25rem',
                color: '#c00'
              }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  User *
                </label>
                <select
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                >
                  <option value="">Select a user...</option>
                  {usersData?.items.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Course *
                </label>
                <select
                  value={createForm.courseId}
                  onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem'
                  }}
                >
                  <option value="">Select a course...</option>
                  {coursesData?.items.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
