import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useEnrollments } from '../hooks/useEnrollments';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../context/AuthContext';

// Shape of enrollment row for the dashboard
interface MyEnrollmentRow {
  enrollmentId: string;
  courseTitle: string;
  isRequired: boolean;
  status: string;
  enrolledDate: string;
  completedDate: string | null;
  daysUntilExpiration: number | null;
}

/**
 * Dashboard page - User's personal training overview
 * Shows only the current user's enrolled courses and their status
 */
export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch user's enrollments
  const { data: enrollmentsData, loading: loadingEnrollments } = useEnrollments(1, 100);
  
  // Fetch all courses for enrichment
  const { data: coursesData, loading: loadingCourses } = useCourses({ pageSize: 100 });

  const loading = loadingEnrollments || loadingCourses;

  // Create course lookup map
  const courseMap = useMemo(() => {
    if (!coursesData?.items) return new Map();
    return new Map(coursesData.items.map(c => [c.id, c]));
  }, [coursesData]);

  // Filter and transform enrollments for current user
  const myEnrollments: MyEnrollmentRow[] = useMemo(() => {
    if (!enrollmentsData?.items || !user) return [];
    
    // For POC: Filter by user email (in real app, would filter by userId)
    const enriched = enrollmentsData.items
      .map(enrollment => {
        const course = courseMap.get(enrollment.courseId);
        if (!course) return null;
        
        return {
          enrollmentId: enrollment.id,
          courseTitle: course.title,
          isRequired: course.isRequired,
          status: enrollment.status,
          enrolledDate: enrollment.enrolledUtc,
          completedDate: enrollment.completedUtc || null,
          daysUntilExpiration: null as number | null // TODO: Calculate from completion date + validity
        };
      })
      .filter(e => e !== null) as MyEnrollmentRow[];
    
    return enriched;
  }, [enrollmentsData, courseMap, user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const active = myEnrollments.filter(e => e.status.toUpperCase() === 'ACTIVE').length;
    const completed = myEnrollments.filter(e => e.status.toUpperCase() === 'COMPLETED').length;
    const required = myEnrollments.filter(e => e.isRequired).length;
    const expiringSoon = 0; // TODO: Calculate based on expiration dates
    
    return { active, completed, required, expiringSoon };
  }, [myEnrollments]);

  // Status badge helper
  const getStatusTone = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'COMPLETED': return 'success';
      case 'ACTIVE': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'EXPIRED': return 'danger';
      default: return 'info';
    }
  };

  // Columns definition for MY enrollments
  const columns = useMemo(
    () => [
      {
        id: 'course',
        header: 'Course',
        accessor: (r: MyEnrollmentRow) => (
          <div>
            <div style={{ fontWeight: 500 }}>{r.courseTitle}</div>
            {r.isRequired && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                ⚠️ Required
              </div>
            )}
          </div>
        )
      },
      {
        id: 'status',
        header: 'Status',
        accessor: (r: MyEnrollmentRow) => (
          <StatusBadge tone={getStatusTone(r.status)}>{r.status}</StatusBadge>
        )
      },
      {
        id: 'enrolled',
        header: 'Enrolled Date',
        accessor: (r: MyEnrollmentRow) => new Date(r.enrolledDate).toLocaleDateString()
      },
      {
        id: 'completed',
        header: 'Completed Date',
        accessor: (r: MyEnrollmentRow) => 
          r.completedDate ? new Date(r.completedDate).toLocaleDateString() : '—'
      },
      {
        id: 'expiration',
        header: 'Days to Expire',
        accessor: (r: MyEnrollmentRow) => 
          r.daysUntilExpiration !== null ? `${r.daysUntilExpiration} days` : '—'
      },
      {
        id: 'actions',
        header: 'Actions',
        accessor: (r: MyEnrollmentRow) => (
          <div style={{ display: 'flex', gap: 8 }}>
            {r.status.toUpperCase() === 'ACTIVE' && (
              <Button
                variant="primary"
                onClick={() => console.log('Continue training', r.enrollmentId)}
                aria-label={`Continue ${r.courseTitle}`}
              >
                Continue
              </Button>
            )}
            {r.status.toUpperCase() === 'COMPLETED' && (
              <Button
                variant="secondary"
                onClick={() => console.log('View certificate', r.enrollmentId)}
                aria-label={`View certificate for ${r.courseTitle}`}
              >
                Certificate
              </Button>
            )}
          </div>
        )
      }
    ],
    []
  );

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1>My Training Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Track your training progress and certification status
          </p>
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                In Progress
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.active}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Completed
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                {stats.completed}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Required Courses
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {stats.required}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Expiring Soon
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
                {stats.expiringSoon}
              </div>
            </div>
          </Card>
        </div>

        {/* My Enrollments Table */}
        <Card title="My Training Courses">
          {loading ? (
            <p>Loading your training data...</p>
          ) : myEnrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '1.125rem' }}>
                You haven't enrolled in any courses yet.
              </p>
              <Button variant="primary" onClick={() => navigate('/courses')}>
                Browse Course Catalog
              </Button>
            </div>
          ) : (
            <Table
              caption="Your Enrolled Courses"
              columns={columns}
              data={myEnrollments}
            />
          )}
        </Card>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            Browse Available Courses
          </Button>
          <Button variant="secondary" onClick={() => navigate('/enrollments')}>
            View All Enrollments
          </Button>
        </div>
      </div>
    </Layout>
  );
}
