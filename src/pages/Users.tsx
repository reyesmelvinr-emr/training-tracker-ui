import React, { useMemo, useState } from 'react';
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useUsers } from '../hooks/useUsers';
import { usersApi } from '../services/apiClient';

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}

interface UserFormData {
  email: string;
  fullName: string;
  isActive: boolean;
}

/**
 * Users management page
 * Displays all users in the system with actions
 */
export function Users() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: usersData, loading, error, refetch } = useUsers(page, pageSize);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Transform API data to table format
  const data: UserRow[] = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items;
  }, [usersData]);

  // Columns definition
  const columns = useMemo(
    () => [
      {
        id: 'email',
        header: 'Email',
        accessor: (r: UserRow) => r.email
      },
      {
        id: 'fullName',
        header: 'Full Name',
        accessor: (r: UserRow) => r.fullName
      },
      {
        id: 'status',
        header: 'Status',
        accessor: (r: UserRow) => (
          <StatusBadge tone={r.isActive ? 'success' : 'danger'}>
            {r.isActive ? 'Active' : 'Inactive'}
          </StatusBadge>
        )
      },
      {
        id: 'created',
        header: 'Created',
        accessor: (r: UserRow) => new Date(r.createdUtc).toLocaleDateString()
      },
      {
        id: 'actions',
        header: 'Actions',
        accessor: (r: UserRow) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="primary"
              onClick={() => handleEditUser(r.id)}
              aria-label={`Edit ${r.fullName}`}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDeleteUser(r.id)}
              aria-label={`Delete ${r.fullName}`}
            >
              Delete
            </Button>
          </div>
        )
      }
    ],
    [data]
  );

  const handleEditUser = (userId: string) => {
    const user = data.find(u => u.id === userId);
    if (user) {
      setEditingUserId(userId);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
      });
      setShowModal(true);
    }
  };

  const handleAddUser = () => {
    setEditingUserId(null);
    setFormData({ email: '', fullName: '', isActive: true });
    setFormError(null);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    const user = data.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      return;
    }

    try {
      await usersApi.delete(userId);
      await refetch();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUserId(null);
    setFormData({ email: '', fullName: '', isActive: true });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (editingUserId) {
        await usersApi.update(editingUserId, formData);
      } else {
        await usersApi.create(formData);
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
          <h1>Users</h1>
          <Card>
            <p style={{ color: 'red' }}>Error loading users: {error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Users</h1>
          <Button variant="primary" onClick={handleAddUser}>
            + Add User
          </Button>
        </div>

        <Card title="All Users">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <>
              <Table
                caption="System Users"
                columns={columns}
                data={data}
              />
              
              {/* Pagination controls */}
              {usersData && usersData.totalPages > 1 && (
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
                    Page {page} of {usersData.totalPages} ({usersData.totalCount} total users)
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => Math.min(usersData.totalPages, p + 1))}
                    disabled={page === usersData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* User Form Modal */}
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
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <h2 style={{ marginTop: 0 }}>
                {editingUserId ? 'Edit User' : 'Add New User'}
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
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    {formLoading ? 'Saving...' : (editingUserId ? 'Update' : 'Create')}
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
