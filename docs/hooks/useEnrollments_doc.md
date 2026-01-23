# useEnrollments Hook Documentation

## Overview

**File:** `src/hooks/useEnrollments.ts`  
**Type:** React Custom Hook  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
React hook for fetching and managing paginated enrollment data with mock support, loading states, error handling, and pagination controls. Provides type-safe enrollment list management with automatic data fetching and refresh capabilities.

### Key Features
- Paginated enrollment loading
- Mock data support for development
- TypeScript type safety
- Loading and error state management
- Manual refetch with useCallback optimization
- Conditional fetching (enabled/disabled)
- Request cancellation on unmount

---

## Hook Signature

```typescript
function useEnrollments(
  page?: number,
  pageSize?: number,
  enabled?: boolean
): {
  data: PagedEnrollments | null;
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
| `data` | `PagedEnrollments \| null` | Paginated enrollment data or null |
| `loading` | `boolean` | True while fetching data |
| `error` | `string \| null` | Error message or null |
| `refetch` | `() => void` | Memoized function to trigger refetch |

---

## Type Definitions

### EnrollmentSummary
```typescript
interface EnrollmentSummary {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}
```

### PagedEnrollments
```typescript
interface PagedEnrollments {
  items: EnrollmentSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## State Management

### Internal State
- `data` - Stores fetched paginated enrollment data
- `loading` - Tracks loading state
- `error` - Stores error messages
- `refetchTrigger` - Counter to trigger manual refetches

### Dependencies
The hook refetches when any of these change:
- `page`
- `pageSize`
- `enabled`
- `refetchTrigger` (internal)

### Memoization
The `refetch` function is memoized with `useCallback` for stable reference:
```typescript
const refetch = useCallback(() => {
  setRefetchTrigger(prev => prev + 1);
}, []);
```

---

## Usage Examples

### Basic Usage
```typescript
import { useEnrollments } from '@/hooks/useEnrollments';

function EnrollmentList() {
  const { data, loading, error } = useEnrollments();

  if (loading) return <div>Loading enrollments...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Enrollments ({data.totalCount})</h2>
      <ul>
        {data.items.map(enrollment => (
          <li key={enrollment.id}>
            User: {enrollment.userId} - Course: {enrollment.courseId}
            <span> Status: {enrollment.status}</span>
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
import { useEnrollments } from '@/hooks/useEnrollments';
import { Button } from '@/components/common/Button';

function PaginatedEnrollments() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  
  const { data, loading, error } = useEnrollments(page, pageSize);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Enrollments - Page {page} of {data?.totalPages}</h2>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Course</th>
            <th>Status</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map(enrollment => (
            <tr key={enrollment.id}>
              <td>{enrollment.id}</td>
              <td>{enrollment.userId}</td>
              <td>{enrollment.courseId}</td>
              <td>{enrollment.status}</td>
              <td>{new Date(enrollment.enrolledUtc).toLocaleDateString()}</td>
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

### With Status Badges
```typescript
import { useEnrollments } from '@/hooks/useEnrollments';
import { Table, Column } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/dateFormatter';

function EnrollmentsTable() {
  const { data, loading, error, refetch } = useEnrollments(1, 50);

  const getStatusTone = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'active': case 'in progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': case 'expired': return 'danger';
      default: return 'info';
    }
  };

  const columns: Column<EnrollmentSummary>[] = [
    {
      id: 'id',
      header: 'Enrollment ID',
      accessor: (row) => row.id
    },
    {
      id: 'user',
      header: 'User',
      accessor: (row) => row.userId
    },
    {
      id: 'course',
      header: 'Course',
      accessor: (row) => row.courseId
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusBadge tone={getStatusTone(row.status)}>
          {row.status}
        </StatusBadge>
      )
    },
    {
      id: 'enrolled',
      header: 'Enrolled Date',
      accessor: (row) => formatDate(row.enrolledUtc)
    },
    {
      id: 'completed',
      header: 'Completed Date',
      accessor: (row) => row.completedUtc ? formatDate(row.completedUtc) : '-'
    }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Enrollments</h2>
        <Button onClick={refetch}>Refresh</Button>
      </div>
      
      <Table 
        columns={columns}
        data={data?.items || []}
        emptyMessage="No enrollments found"
        caption="User course enrollments"
      />
      
      <div>
        Total: {data?.totalCount} enrollments
      </div>
    </div>
  );
}
```

---

### Conditional Fetching
```typescript
function UserEnrollments({ userId }: { userId: string | null }) {
  const shouldFetch = Boolean(userId);
  const { data, loading } = useEnrollments(1, 10, shouldFetch);

  if (!userId) {
    return <div>Select a user to view enrollments</div>;
  }

  if (loading) return <div>Loading enrollments for user...</div>;

  return (
    <div>
      <h3>Enrollments for User: {userId}</h3>
      <ul>
        {data?.items
          .filter(e => e.userId === userId)
          .map(enrollment => (
            <li key={enrollment.id}>
              Course: {enrollment.courseId} - {enrollment.status}
            </li>
          ))}
      </ul>
    </div>
  );
}
```

---

### With Filters
```typescript
import { useMemo, useState } from 'react';

function FilteredEnrollments() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data, loading, error } = useEnrollments(1, 100);

  const filteredEnrollments = useMemo(() => {
    if (!data?.items) return [];
    if (statusFilter === 'all') return data.items;
    return data.items.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
  }, [data, statusFilter]);

  return (
    <div>
      <div>
        <label>Filter by status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        Showing {filteredEnrollments.length} of {data?.totalCount} enrollments
      </div>

      <ul>
        {filteredEnrollments.map(enrollment => (
          <li key={enrollment.id}>
            {enrollment.userId} - {enrollment.courseId}: {enrollment.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### With Refetch on Action
```typescript
function EnrollmentManager() {
  const { data, loading, error, refetch } = useEnrollments();

  const handleEnrollUser = async (userId: string, courseId: string) => {
    try {
      await api.post('/api/enrollments', { userId, courseId });
      // Refresh the list
      refetch();
      toast.success('User enrolled successfully');
    } catch (err) {
      toast.error('Failed to enroll user');
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    try {
      await api.patch(`/api/enrollments/${enrollmentId}`, { status: 'Cancelled' });
      refetch();
      toast.success('Enrollment cancelled');
    } catch (err) {
      toast.error('Failed to cancel enrollment');
    }
  };

  return (
    <div>
      <EnrollmentForm onSubmit={handleEnrollUser} />
      <EnrollmentList 
        enrollments={data?.items || []}
        onCancel={handleCancelEnrollment}
      />
    </div>
  );
}
```

---

### Loading Skeleton
```typescript
function EnrollmentsWithSkeleton() {
  const { data, loading, error } = useEnrollments();

  if (loading && !data) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="enrollment-row skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.items.map(enrollment => (
        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
```

---

### With Search
```typescript
function SearchableEnrollments() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading } = useEnrollments(1, 100);

  const searchResults = useMemo(() => {
    if (!data?.items || !searchTerm) return data?.items || [];
    
    const term = searchTerm.toLowerCase();
    return data.items.filter(e => 
      e.id.toLowerCase().includes(term) ||
      e.userId.toLowerCase().includes(term) ||
      e.courseId.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  return (
    <div>
      <input 
        type="text"
        placeholder="Search enrollments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div>Found {searchResults.length} enrollments</div>
      
      <ul>
        {searchResults.map(enrollment => (
          <li key={enrollment.id}>
            {enrollment.id} - {enrollment.userId} - {enrollment.courseId}
          </li>
        ))}
      </ul>
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
- `react` - useEffect, useState, useCallback

### Used By
- Enrollments page
- User profile pages (enrollment history)
- Course pages (enrolled users)
- Admin enrollment management
- Dashboard enrollment widgets

---

## Mock Data Support

### Mock Response Structure
When `VITE_USE_API_MOCKS=true`, returns empty mock data:

```typescript
const mock: PagedEnrollments = {
  items: [],
  page,
  pageSize,
  totalCount: 0,
  totalPages: 0
};
```

### Extending Mock Data
You can enhance the mock in `src/mocks/enrollments.ts`:

```typescript
export const mockEnrollments: EnrollmentSummary[] = [
  {
    id: 'e1',
    userId: 'u1',
    courseId: 'c1',
    status: 'Active',
    enrolledUtc: '2026-01-15T10:00:00Z',
    completedUtc: null
  },
  // ... more enrollments
];

export function pagedEnrollmentsMock(page: number, pageSize: number): PagedEnrollments {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    items: mockEnrollments.slice(start, end),
    page,
    pageSize,
    totalCount: mockEnrollments.length,
    totalPages: Math.ceil(mockEnrollments.length / pageSize)
  };
}
```

---

## Error Handling

### Error States
- Network failures
- API errors (4xx, 5xx)
- Timeout errors
- Cancelled requests

### Error Recovery Pattern
```typescript
function EnrollmentsWithRetry() {
  const { data, loading, error, refetch } = useEnrollments();
  
  useEffect(() => {
    if (error) {
      console.error('Enrollment fetch failed:', error);
      
      // Notify user
      toast.error('Failed to load enrollments. Click to retry.', {
        onClick: refetch
      });
    }
  }, [error, refetch]);

  if (error) {
    return (
      <div>
        <p>Failed to load enrollments</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  // ... rest of component
}
```

---

## Performance Considerations

### Request Cancellation
Properly cancels requests on unmount to prevent memory leaks:

```typescript
useEffect(() => {
  let cancelled = false;
  
  // Fetch data...
  .then(r => { if (!cancelled) setData(r); })
  
  return () => { cancelled = true; };
}, [page, pageSize, enabled, refetchTrigger]);
```

### Optimization Tips

#### 1. Memoized Refetch
The hook already memoizes the `refetch` function:
```typescript
const refetch = useCallback(() => {
  setRefetchTrigger(prev => prev + 1);
}, []);
```

#### 2. Debounce Pagination
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function DebouncedPagination() {
  const [page, setPage] = useState(1);
  const debouncedPage = useDebouncedValue(page, 500);
  
  const { data } = useEnrollments(debouncedPage, 20);
  
  return <div>{/* UI */}</div>;
}
```

#### 3. Cache Previous Results
```typescript
const [cachedData, setCachedData] = useState<Record<number, PagedEnrollments>>({});

useEffect(() => {
  if (data) {
    setCachedData(prev => ({ ...prev, [page]: data }));
  }
}, [data, page]);

// Show cached data while loading
const displayData = loading ? cachedData[page] : data;
```

---

## Testing

### Test Scenarios
1. Fetches enrollments on mount
2. Handles pagination changes
3. Respects enabled flag
4. Handles errors gracefully
5. Refetch function triggers new fetch
6. Cancels on unmount
7. Uses mock data when configured

### Example Tests
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useEnrollments } from './useEnrollments';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('useEnrollments', () => {
  const mockData = {
    items: [
      {
        id: 'e1',
        userId: 'u1',
        courseId: 'c1',
        status: 'Active',
        enrolledUtc: '2026-01-20T10:00:00Z',
        completedUtc: null
      }
    ],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches enrollments on mount', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useEnrollments());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles errors', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useEnrollments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('refetches when refetch is called', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useEnrollments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    result.current.refetch();
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useEnrollments(1, 10, false));
    
    expect(api.get).not.toHaveBeenCalled();
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
- [useUsers Hook](./useUsers_doc.md) - Similar pattern for users
- [useCourses Hook](./useCourses_doc.md) - Similar pattern for courses
- [API Service](../services/api_doc.md) - HTTP client
- [Table Component](../components/Table_doc.md) - Display enrollments

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
