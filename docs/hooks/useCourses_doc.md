# useCourses Hook Documentation

## Overview

**File:** `src/hooks/useCourses.ts`  
**Type:** React Custom Hook  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
React hook for fetching and managing paginated course data with built-in mock data support, loading states, error handling, and pagination controls. Provides type-safe course list management with automatic data fetching and refresh capabilities.

### Key Features
- Paginated course loading
- Mock data support for development
- TypeScript type safety
- Loading and error state management
- Manual refetch capability
- Conditional fetching (enabled/disabled)
- Request cancellation on unmount

---

## Hook Signature

```typescript
function useCourses(options?: UseCoursesOptions): {
  data: PagedCourses | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

---

## Parameters

### UseCoursesOptions
```typescript
interface UseCoursesOptions {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `page` | `number` | `1` | Current page number (1-indexed) |
| `pageSize` | `number` | `10` | Number of items per page |
| `enabled` | `boolean` | `true` | Whether to fetch data automatically |

---

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `PagedCourses \| null` | Paginated course data or null |
| `loading` | `boolean` | True while fetching data |
| `error` | `string \| null` | Error message or null |
| `refetch` | `() => void` | Function to manually trigger refetch |

---

## Type Definitions

### CourseSummary
```typescript
interface CourseSummary {
  id: string;
  title: string;
  isRequired: boolean;
  isActive: boolean;
}
```

### PagedCourses
```typescript
interface PagedCourses {
  items: CourseSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## State Management

### Internal State
- `data` - Stores fetched paginated course data
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
import { useCourses } from '@/hooks/useCourses';

function CourseList() {
  const { data, loading, error } = useCourses();

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Courses ({data.totalCount})</h2>
      <ul>
        {data.items.map(course => (
          <li key={course.id}>
            {course.title}
            {course.isRequired && <span> (Required)</span>}
            {!course.isActive && <span> (Inactive)</span>}
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
import { useCourses } from '@/hooks/useCourses';
import { useState } from 'react';
import { Button } from '@/components/common/Button';

function PaginatedCourseList() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const { data, loading, error } = useCourses({ page, pageSize });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Courses (Page {page} of {data?.totalPages})</h2>
      
      <ul>
        {data?.items.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
      
      <div className="pagination">
        <Button 
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        
        <span>Page {page} of {data?.totalPages}</span>
        
        <Button 
          onClick={() => setPage(p => p + 1)}
          disabled={page === data?.totalPages || loading}
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
import { useCourses } from '@/hooks/useCourses';
import { Table, Column } from '@/components/common/Table';
import { StatusBadge } from '@/components/common/StatusBadge';

function CoursesTable() {
  const { data, loading, error, refetch } = useCourses({ pageSize: 50 });

  const columns: Column<CourseSummary>[] = [
    {
      id: 'title',
      header: 'Course Title',
      accessor: (row) => row.title
    },
    {
      id: 'required',
      header: 'Required',
      accessor: (row) => row.isRequired ? 'Yes' : 'No'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusBadge tone={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    }
  ];

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Courses</h2>
        <Button onClick={refetch}>Refresh</Button>
      </div>
      
      <Table 
        columns={columns} 
        data={data?.items || []}
        emptyMessage="No courses found"
      />
      
      <div>
        Showing {data?.items.length} of {data?.totalCount} courses
      </div>
    </div>
  );
}
```

---

### With Custom Page Size
```typescript
function CourseListWithCustomPageSize() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  
  const { data, loading } = useCourses({ page, pageSize });

  return (
    <div>
      <div>
        <label>Items per page:</label>
        <select 
          value={pageSize} 
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      
      {/* Display courses */}
    </div>
  );
}
```

---

### With Conditional Fetching
```typescript
function ConditionalCourseList({ shouldFetch }: { shouldFetch: boolean }) {
  const { data, loading, error } = useCourses({ enabled: shouldFetch });

  if (!shouldFetch) {
    return <div>Fetching disabled</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Display courses */}</div>;
}

// Usage
function ParentComponent() {
  const [showCourses, setShowCourses] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowCourses(!showCourses)}>
        Toggle Courses
      </button>
      
      <ConditionalCourseList shouldFetch={showCourses} />
    </div>
  );
}
```

---

### With Filtering (Client-Side)
```typescript
import { useMemo, useState } from 'react';

function FilterableCourseList() {
  const { data, loading, error } = useCourses({ pageSize: 100 });
  const [filter, setFilter] = useState<'all' | 'required' | 'optional'>('all');

  const filteredCourses = useMemo(() => {
    if (!data?.items) return [];
    
    switch (filter) {
      case 'required':
        return data.items.filter(c => c.isRequired);
      case 'optional':
        return data.items.filter(c => !c.isRequired);
      default:
        return data.items;
    }
  }, [data, filter]);

  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('required')}>Required</button>
        <button onClick={() => setFilter('optional')}>Optional</button>
      </div>
      
      <ul>
        {filteredCourses.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
      
      <div>
        Showing {filteredCourses.length} of {data?.totalCount} courses
      </div>
    </div>
  );
}
```

---

### With Refresh on Action
```typescript
function CourseListWithActions() {
  const { data, loading, error, refetch } = useCourses();

  const handleCourseCreated = async (courseData: any) => {
    try {
      await api.post('/api/courses', courseData);
      // Refresh the list after creating
      refetch();
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const handleCourseDeleted = async (courseId: string) => {
    try {
      await api.delete(`/api/courses/${courseId}`);
      // Refresh the list after deleting
      refetch();
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  return (
    <div>
      <CreateCourseForm onSubmit={handleCourseCreated} />
      <CourseList 
        courses={data?.items || []} 
        onDelete={handleCourseDeleted}
      />
    </div>
  );
}
```

---

### Loading State with Skeleton
```typescript
function CourseListWithSkeleton() {
  const { data, loading, error } = useCourses();

  if (loading && !data) {
    return (
      <div className="course-list">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="course-card skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="course-list">
      {data?.items.map(course => (
        <CourseCard key={course.id} course={course} />
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
- `@/mocks/courses` - Mock course data
  - `pagedCoursesMock()` - Mock pagination data

#### External
- `react` - useEffect, useState

### Used By
- Course catalog page
- Course selection components
- Admin course management
- Dashboard course widgets

---

## Mock Data Support

### Development Mode
When `VITE_USE_API_MOCKS=true`, the hook uses mock data:

```typescript
maybeMock(pagedCoursesMock(page, pageSize), async () => {
  const res = await api.get<PagedCourses>(`/api/courses`, { 
    params: { page, pageSize } 
  });
  return res.data;
});
```

### Mock Data Structure
```typescript
// Example mock response
{
  items: [
    {
      id: "course-1",
      title: "Safety Training 101",
      isRequired: true,
      isActive: true
    },
    // ... more courses
  ],
  page: 1,
  pageSize: 10,
  totalCount: 45,
  totalPages: 5
}
```

---

## Error Handling

### Error States
The hook catches and handles:
- Network errors
- API errors (4xx, 5xx)
- Parsing errors
- Cancelled requests

### Error Recovery
```typescript
function CourseListWithRetry() {
  const { data, loading, error, refetch } = useCourses();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  if (error && retryCount >= 3) {
    return <div>Failed after 3 attempts. Please try again later.</div>;
  }

  // ... rest of component
}
```

---

## Performance Considerations

### Request Cancellation
The hook properly cancels requests on unmount:

```typescript
useEffect(() => {
  let isCancelled = false;
  
  // Fetch data...
  
  return () => {
    isCancelled = true; // Prevent state updates after unmount
  };
}, [page, pageSize, enabled, refetchTrigger]);
```

### Optimization Tips

#### 1. Debounce Page Changes
```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function OptimizedPagination() {
  const [page, setPage] = useState(1);
  const debouncedPage = useDebouncedValue(page, 300);
  
  const { data } = useCourses({ page: debouncedPage });
  
  return (
    <input 
      type="number" 
      value={page}
      onChange={(e) => setPage(Number(e.target.value))}
    />
  );
}
```

#### 2. Memoize Expensive Calculations
```typescript
const enrichedCourses = useMemo(() => {
  return data?.items.map(course => ({
    ...course,
    displayTitle: formatTitle(course.title),
    statusLabel: getStatusLabel(course)
  }));
}, [data]);
```

#### 3. Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList } from 'react-window';

function VirtualizedCourseList() {
  const { data } = useCourses({ pageSize: 1000 });

  if (!data) return null;

  return (
    <FixedSizeList
      height={600}
      itemCount={data.items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {data.items[index].title}
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## Testing

### Test Scenarios
1. Fetches courses on mount
2. Handles pagination correctly
3. Respects enabled flag
4. Handles errors
5. Refetch function works
6. Cancels requests on unmount
7. Uses mock data in test mode

### Example Tests
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCourses } from './useCourses';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('useCourses', () => {
  it('fetches courses on mount', async () => {
    const mockData = {
      items: [
        { id: '1', title: 'Course 1', isRequired: true, isActive: true }
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1
    };
    
    (api.get as jest.Mock).mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useCourses());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
  });
  
  it('does not fetch when enabled is false', () => {
    renderHook(() => useCourses({ enabled: false }));
    
    expect(api.get).not.toHaveBeenCalled();
  });
  
  it('refetches when page changes', async () => {
    const { result, rerender } = renderHook(
      ({ page }) => useCourses({ page }),
      { initialProps: { page: 1 } }
    );
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(api.get).toHaveBeenCalledWith(
      '/api/courses',
      expect.objectContaining({ params: { page: 1, pageSize: 10 } })
    );
    
    rerender({ page: 2 });
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/api/courses',
        expect.objectContaining({ params: { page: 2, pageSize: 10 } })
      );
    });
  });
});
```

---

## Common Patterns

### Infinite Scroll
```typescript
function InfiniteScrollCourses() {
  const [page, setPage] = useState(1);
  const [allCourses, setAllCourses] = useState<CourseSummary[]>([]);
  
  const { data, loading } = useCourses({ page, pageSize: 20 });

  useEffect(() => {
    if (data?.items) {
      setAllCourses(prev => [...prev, ...data.items]);
    }
  }, [data]);

  const loadMore = () => {
    if (data && page < data.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div>
      <ul>
        {allCourses.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
      
      {loading && <div>Loading more...</div>}
      
      {page < (data?.totalPages || 0) && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}
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
- Fetch API or Axios

---

## Related Documentation
- [API Service](../services/api_doc.md) - HTTP client
- [API Client Service](../services/apiClient_doc.md) - Alternative API client
- [Table Component](../components/Table_doc.md) - Display course data
- [StatusBadge Component](../components/StatusBadge_doc.md) - Course status

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
