import React, { useMemo, useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useCourses } from '../hooks/useCourses';
import { coursesApi } from '../services/apiClient';

interface CourseRow {
  id: string;
  title: string;
  category?: string;
  validityMonths?: number;
  description?: string;
  isRequired: boolean;
  isActive: boolean;
}

interface CourseFormData {
  title: string;
  category: string;
  validityMonths: string;
  description: string;
  isRequired: boolean;
  isActive: boolean;
}

/**
 * Course Catalog page
 * Displays all available courses
 */
export function CourseCatalog() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: coursesData, loading, error, refetch } = useCourses({ page, pageSize });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    category: '',
    validityMonths: '',
    description: '',
    isRequired: false,
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Transform API data to table format
  const data: CourseRow[] = useMemo(() => {
    if (!coursesData?.items) return [];
    return coursesData.items;
  }, [coursesData]);

  // Columns definition
  const columns = useMemo(
    () => [
      {
        id: 'title',
        header: 'Course Title',
        accessor: (r: CourseRow) => r.title
      },
      {
        id: 'category',
        header: 'Category',
        accessor: (r: CourseRow) => r.category || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>
      },
      {
        id: 'validity',
        header: 'Validity',
        accessor: (r: CourseRow) => r.validityMonths ? `${r.validityMonths} months` : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>
      },
      {
        id: 'status',
        header: 'Status',
        accessor: (r: CourseRow) => (
          <StatusBadge tone={r.isActive ? 'success' : 'danger'}>
            {r.isActive ? 'Active' : 'Inactive'}
          </StatusBadge>
        )
      },
      {
        id: 'required',
        header: 'Required',
        accessor: (r: CourseRow) => (
          <StatusBadge tone={r.isRequired ? 'warning' : 'info'}>
            {r.isRequired ? 'Required' : 'Optional'}
          </StatusBadge>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        accessor: (r: CourseRow) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="primary"
              onClick={() => handleEditCourse(r.id)}
              aria-label={`Edit ${r.title}`}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDeleteCourse(r.id)}
              aria-label={`Delete ${r.title}`}
            >
              Delete
            </Button>
          </div>
        )
      }
    ],
    [data]
  );

  const handleEditCourse = (courseId: string) => {
    const course = data.find(c => c.id === courseId);
    if (course) {
      setEditingCourseId(courseId);
      setFormData({
        title: course.title,
        category: course.category || '',
        validityMonths: course.validityMonths?.toString() || '',
        description: course.description || '',
        isRequired: course.isRequired,
        isActive: course.isActive,
      });
      setShowModal(true);
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    console.log('Enroll in course:', courseId);
    // TODO: Implement enrollment functionality
  };

  const handleAddCourse = () => {
    setEditingCourseId(null);
    setFormData({
      title: '',
      category: '',
      validityMonths: '',
      description: '',
      isRequired: false,
      isActive: true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const course = data.find(c => c.id === courseId);
    if (!course) return;
    
    if (!confirm(`Are you sure you want to delete course "${course.title}"?`)) {
      return;
    }

    try {
      await coursesApi.delete(courseId);
      await refetch();
    } catch (err: any) {
      alert(`Failed to delete course: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourseId(null);
    setFormData({
      title: '',
      category: '',
      validityMonths: '',
      description: '',
      isRequired: false,
      isActive: true,
    });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        validityMonths: formData.validityMonths ? parseInt(formData.validityMonths) : null,
        category: formData.category || null,
        description: formData.description || null,
      };

      if (editingCourseId) {
        await coursesApi.update(editingCourseId, payload);
      } else {
        await coursesApi.create(payload);
      }
      await refetch();
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div>
          <h1>Course Catalog</h1>
          <Card>
            <p style={{ color: 'red' }}>Error loading courses: {error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Course Catalog</h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Browse and enroll in available training courses
            </p>
          </div>
          <Button variant="primary" onClick={handleAddCourse}>
            + Add Course
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
                Total Courses
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {coursesData?.totalCount || 0}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Required Courses
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                {data.filter(c => c.isRequired).length}
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Optional Courses
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                {data.filter(c => !c.isRequired).length}
              </div>
            </div>
          </Card>
        </div>

        <Card title="Available Courses">
          {loading ? (
            <p>Loading courses...</p>
          ) : data.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No courses available. Add your first course to get started.
            </p>
          ) : (
            <>
              <Table
                caption="All Available Courses"
                columns={columns}
                data={data}
              />
              
              {/* Pagination controls */}
              {coursesData && coursesData.totalPages > 1 && (
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
                    Page {page} of {coursesData.totalPages} ({coursesData.totalCount} total courses)
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.min(coursesData.totalPages, p + 1))}
                    disabled={page === coursesData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Course Form Modal */}
        {showModal && (
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
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{ marginTop: 0 }}>
                {editingCourseId ? 'Edit Course' : 'Add New Course'}
              </h2>

              {formError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '4px',
                  border: '1px solid #fecaca',
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    disabled={formLoading}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Safety, Technical, Compliance, Leadership"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    disabled={formLoading}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Optional - Examples: Safety, Technical, Compliance, Leadership, Soft Skills
                  </small>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Validity (months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.validityMonths}
                    onChange={(e) => setFormData({ ...formData, validityMonths: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    disabled={formLoading}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                    disabled={formLoading}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      style={{ marginRight: '8px' }}
                      disabled={formLoading}
                    />
                    Required Course
                  </label>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ marginRight: '8px' }}
                      disabled={formLoading}
                    />
                    Active
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Saving...' : (editingCourseId ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
