# useUsers Hook Documentation

## Overview

**File:** `src/hooks/useUsers.ts`  
**Type:** React Custom Hook  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
React hook for fetching and managing paginated user data with built-in mock data support, loading states, error handling, and pagination controls. Provides type-safe user list management with automatic data fetching and refresh capabilities.

### Key Features
- Paginated user loading
- Built-in mock data with sample users
- TypeScript type safety
- Loading and error state management
- Manual refetch capability
- Conditional fetching (enabled/disabled)
- Request cancellation on unmount

---

## Hook Signature

```typescript
function useUsers(
  page?: number,
  pageSize?: number,
  enabled?: boolean
): {
  data: PagedUsers | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

---

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Current page number (1-indexed) |
| `pageSize` | `number` | `10` | Number of items per page |
| `enabled` | `boolean` | `true` | Whether to fetch data automatically |

---

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `PagedUsers \| null` | Paginated user data or null |
| `loading` | `boolean` | True while fetching data |
| `error` | `string \| null` | Error message or null |
| `refetch` | `() => void` | Function to manually trigger refetch |

---

## Type Definitions

### UserSummary
```typescript
interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}
```

### PagedUsers
```typescript
interface PagedUsers {
  items: UserSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## State Management

### Internal State
- `data` - Stores fetched paginated user data
- `loading` - Tracks loading state
- `error` - Stores error messages
- `refetchTrigger` - Counter to trigger manual refetches

### Dependencies
The hook refetches when any of these change:
- `page`
- `pageSize`
- `enabled`
- `refetchTrigger` (internal)

---

## Usage Examples

### Basic Usage
```typescript
import { useUsers } from '@/hooks/useUsers';

function UserList() {
  const { data, loading, error } = useUsers();

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Users ({data.totalCount})</h2>
      <ul>
        {data.items.map(user => (
          <li key={user.id}>
            {user.fullName} ({user.email})
            {!user.isActive && <span> - Inactive</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### With Pagination
```typescript
import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/common/Button';

function PaginatedUserList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const { data, loading, error } = useUsers(page, pageSize);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users - Page {page} of {data?.totalPages}</h2>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map(user => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.isActive ? 'Active' : 'Inactive'}</td>
              <td>{new Date(user.createdUtc).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <Button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page} / {data?.totalPages}</span>
        <Button 
          onClick={() => setPage(p => p + 1)}
          disabled={page === data?.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

---

### With Table Component
```typescript
import { useUsers } from '@/hooks/useUsers';
import { Table, Column } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/dateFormatter';

function UsersTable() {
  const { data, loading, error, refetch } = useUsers(1, 50);

  const columns: Column<UserSummary>[] = [
    {
      id: 'name',
      header: 'Full Name',
      accessor: (row) => row.fullName
    },
    {
      id: 'email',
      header: 'Email',
      accessor: (row) => row.email
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusBadge tone={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    {
      id: 'created',
      header: 'Created',
      accessor: (row) => formatDate(row.createdUtc)
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => handleEdit(row.id)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Users</h2>
        <Button onClick={refetch}>Refresh</Button>
      </div>
      
      <Table 
        columns={columns}
        data={data?.items || []}
        emptyMessage="No users found"
        caption="System users list"
      />
      
      <div>
        Total: {data?.totalCount} users
      </div>
    </div>
  );
}
```

---

### With Filters
```typescript
import { useMemo, useState } from 'react';

function FilteredUserList() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { data, loading, error } = useUsers(1, 100);

  const filteredUsers = useMemo(() => {
    if (!data?.items) return [];
    
    switch (statusFilter) {
      case 'active':
        return data.items.filter(u => u.isActive);
      case 'inactive':
        return data.items.filter(u => !u.isActive);
      default:
        return data.items;
    }
  }, [data, statusFilter]);

  return (
    <div>
      <div>
        <button onClick={() => setStatusFilter('all')}>All</button>
        <button onClick={() => setStatusFilter('active')}>Active</button>
        <button onClick={() => setStatusFilter('inactive')}>Inactive</button>
      </div>

      <div>
        Showing {filteredUsers.length} of {data?.totalCount} users
      </div>

      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>
            {user.fullName} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Conditional Fetching
```typescript
function AdminUserList({ isAdmin }: { isAdmin: boolean }) {
  const { data, loading, error } = useUsers(1, 10, isAdmin);

  if (!isAdmin) {
    return <div>Admin access required</div>;
  }

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Management</h2>
      <ul>
        {data?.items.map(user => (
          <li key={user.id}>{user.fullName}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### With Search
```typescript
import { useMemo, useState } from 'react';

function SearchableUserList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useUsers(1, 100);

  const searchResults = useMemo(() => {
    if (!data?.items || !searchTerm) return data?.items || [];
    
    const term = searchTerm.toLowerCase();
    return data.items.filter(user => 
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  return (
    <div>
      <input 
        type="text"
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div>Found {searchResults.length} users</div>
      
      <ul>
        {searchResults.map(user => (
          <li key={user.id}>
            <strong>{user.fullName}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### With Bulk Actions
```typescript
import { useState } from 'react';
import { adminService } from '@/services/adminService';

function UsersWithBulkActions() {
  const { data, loading, error, refetch } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (!data?.items) return;
    setSelectedUsers(new Set(data.items.map(u => u.id)));
  };

  const handleDeselectAll = () => {
    setSelectedUsers(new Set());
  };

  const handleBulkDeactivate = async () => {
    try {
      await adminService.bulkUpdateUserStatus({
        userIds: Array.from(selectedUsers),
        isActive: false
      });
      refetch();
      setSelectedUsers(new Set());
      toast.success('Users deactivated successfully');
    } catch (err) {
      toast.error('Failed to deactivate users');
    }
  };

  return (
    <div>
      <div>
        <Button onClick={handleSelectAll}>Select All</Button>
        <Button onClick={handleDeselectAll}>Deselect All</Button>
        <Button 
          onClick={handleBulkDeactivate}
          disabled={selectedUsers.size === 0}
          variant="danger"
        >
          Deactivate Selected ({selectedUsers.size})
        </Button>
      </div>

      <ul>
        {data?.items.map(user => (
          <li key={user.id}>
            <input 
              type="checkbox"
              checked={selectedUsers.has(user.id)}
              onChange={(e) => {
                const newSelected = new Set(selectedUsers);
                if (e.target.checked) {
                  newSelected.add(user.id);
                } else {
                  newSelected.delete(user.id);
                }
                setSelectedUsers(newSelected);
              }}
            />
            {user.fullName} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### With Refetch After Action
```typescript
function UserManager() {
  const { data, loading, error, refetch } = useUsers();

  const handleCreateUser = async (userData: any) => {
    try {
      await api.post('/api/users', userData);
      refetch(); // Refresh the list
      toast.success('User created successfully');
    } catch (err) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      await api.put(`/api/users/${userId}`, userData);
      refetch();
      toast.success('User updated successfully');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      await api.delete(`/api/users/${userId}`);
      refetch();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <CreateUserForm onSubmit={handleCreateUser} />
      <UserList 
        users={data?.items || []}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
```

---

### Loading Skeleton
```typescript
function UsersWithSkeleton() {
  const { data, loading, error } = useUsers();

  if (loading && !data) {
    return (
      <div className="user-list">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="user-card skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      {data?.items.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## Integration Points

### Dependencies

#### Internal
- `@/services/api` - API client
  - `api.get()` - HTTP GET requests
  - `maybeMock()` - Mock data toggle

#### External
- `react` - useEffect, useState

### Used By
- Users page
- User management components
- Admin panel
- User selection dropdowns
- Dashboard user widgets

---

## Mock Data Support

### Built-in Mock Data
The hook includes sample mock data for development:

```typescript
const mock: PagedUsers = {
  items: [
    { 
      id: 'u1', 
      email: 'alice@example.com', 
      fullName: 'Alice Example', 
      isActive: true, 
      createdUtc: new Date().toISOString() 
    },
    { 
      id: 'u2', 
      email: 'bob@example.com', 
      fullName: 'Bob Example', 
      isActive: true, 
      createdUtc: new Date().toISOString() 
    }
  ],
  page,
  pageSize,
  totalCount: 2,
  totalPages: 1
};
```

### Using Mock Data
Set environment variable:
```env
VITE_USE_API_MOCKS=true
```

### Extending Mock Data
Create `src/mocks/users.ts`:

```typescript
export const mockUsers: UserSummary[] = [
  {
    id: 'u1',
    email: 'john.doe@emerson.com',
    fullName: 'John Doe',
    isActive: true,
    createdUtc: '2025-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    email: 'jane.smith@emerson.com',
    fullName: 'Jane Smith',
    isActive: true,
    createdUtc: '2025-01-02T00:00:00Z'
  },
  // ... more users
];

export function pagedUsersMock(page: number, pageSize: number): PagedUsers {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: mockUsers.slice(start, end),
    page,
    pageSize,
    totalCount: mockUsers.length,
    totalPages: Math.ceil(mockUsers.length / pageSize)
  };
}
```

Then use in hook:
```typescript
import { pagedUsersMock } from '../mocks/users';

maybeMock(pagedUsersMock(page, pageSize), async () => {
  // API call
});
```

---

## Error Handling

### Error Recovery
```typescript
function UsersWithRetry() {
  const { data, loading, error, refetch } = useUsers();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (error && retryCount < 3) {
      const timeout = setTimeout(() => {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount, refetch]);

  if (error && retryCount >= 3) {
    return (
      <div>
        <p>Failed to load users after 3 attempts.</p>
        <Button onClick={() => { setRetryCount(0); refetch(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  // ... rest of component
}
```

---

## Performance Considerations

### Request Cancellation
Properly cancels requests on unmount:

```typescript
useEffect(() => {
  let cancelled = false;
  
  // Fetch data...
  .then(r => { if (!cancelled) setData(r); })
  
  return () => { cancelled = true; };
}, [page, pageSize, enabled, refetchTrigger]);
```

### Optimization Tips

#### 1. Memoize Filtered/Sorted Data
```typescript
const sortedUsers = useMemo(() => {
  if (!data?.items) return [];
  return [...data.items].sort((a, b) => 
    a.fullName.localeCompare(b.fullName)
  );
}, [data]);
```

#### 2. Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList } from 'react-window';

function VirtualUserList() {
  const { data } = useUsers(1, 1000);

  if (!data) return null;

  return (
    <FixedSizeList
      height={600}
      itemCount={data.items.length}
      itemSize={60}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <UserRow user={data.items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## Testing

### Example Tests
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from './useUsers';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('useUsers', () => {
  const mockData = {
    items: [
      {
        id: 'u1',
        email: 'test@emerson.com',
        fullName: 'Test User',
        isActive: true,
        createdUtc: '2026-01-01T00:00:00Z'
      }
    ],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1
  };

  it('fetches users on mount', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
  });

  it('handles errors', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('refetches when refetch is called', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    result.current.refetch();
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- React Hooks (React 16.8+)
- Async/await
- Promise API

---

## Related Documentation
- [useCourses Hook](./useCourses_doc.md) - Similar pattern for courses
- [useEnrollments Hook](./useEnrollments_doc.md) - Similar pattern for enrollments
- [API Service](../services/api_doc.md) - HTTP client
- [Admin Service](../services/adminService_doc.md) - Bulk user operations
- [Table Component](../components/Table_doc.md) - Display users

---

## Maintenance & Support

**Owner:** Frontend Team  
**Tech Lead:** melvin.reyes@emerson.com  
**Last Review:** January 23, 2026

---

<!-- AKR Documentation Metadata -->
<!-- Generated: 2026-01-23 -->
<!-- Template: service-standard -->
<!-- AI-Generated: true -->
