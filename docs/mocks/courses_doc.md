# Mock Courses Data Documentation

## Mock Data Overview

**File:** `src/mocks/courses.ts`  
**Type:** Mock Data (Testing/Development)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Provides mock course data for development and testing purposes without requiring backend API calls. Enables rapid UI development, testing of pagination, and demonstration of components without external dependencies.

### Key Features
- `pagedCoursesMock` function returning paginated course data
- `emptyCoursesMock` constant for empty state testing
- Sample courses with realistic data structure
- Pagination format matching API contract
- Configurable page and page size
- Integration with `VITE_USE_API_MOCKS` environment variable

---

## Data Structures

### Course Item Interface
```typescript
interface CourseItem {
  id: string;
  title: string;
  isRequired: boolean;
  isActive: boolean;
}
```

**Properties:**

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `id` | `string` | Unique course identifier | `'mock-1'` |
| `title` | `string` | Course display name | `'Mock Safety Orientation'` |
| `isRequired` | `boolean` | Whether course is required | `true` |
| `isActive` | `boolean` | Whether course is active/available | `true` |

### PagedCourses Interface
```typescript
interface PagedCourses {
  items: CourseItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

**Properties:**

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `items` | `CourseItem[]` | Array of courses on current page | `[{...}, {...}]` |
| `page` | `number` | Current page number (1-indexed) | `1` |
| `pageSize` | `number` | Items per page | `10` |
| `totalCount` | `number` | Total courses across all pages | `2` |
| `totalPages` | `number` | Total number of pages | `1` |

---

## Mock Functions

### pagedCoursesMock()

#### Function Signature
```typescript
export const pagedCoursesMock = (page = 1, pageSize = 10): PagedCourses => ({
  items: [
    { id: 'mock-1', title: 'Mock Safety Orientation', isRequired: true, isActive: true },
    { id: 'mock-2', title: 'Mock Leadership Essentials', isRequired: false, isActive: true }
  ],
  page,
  pageSize,
  totalCount: 2,
  totalPages: 1
});
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number to retrieve (1-indexed) |
| `pageSize` | `number` | `10` | Number of items per page |

#### Return Value
Returns a `PagedCourses` object with mock course data.

#### Mock Courses Included

1. **Mock Safety Orientation**
   - ID: `'mock-1'`
   - Required: `true`
   - Active: `true`
   - Purpose: Baseline training course

2. **Mock Leadership Essentials**
   - ID: `'mock-2'`
   - Required: `false`
   - Active: `true`
   - Purpose: Optional development course

---

### emptyCoursesMock

#### Constant Definition
```typescript
export const emptyCoursesMock: PagedCourses = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0
};
```

#### Use Cases
- Testing empty state UI
- Initial component render
- No courses available scenario
- Loading state verification

---

## Usage Examples

### Example 1: Basic Mock Data in Component
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

function CourseList() {
  // Use mock data directly for testing
  const mockData = pagedCoursesMock();
  
  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {mockData.items.map(course => (
          <li key={course.id}>
            {course.title}
            {course.isRequired && <span> (Required)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Example 2: Environment-Based Mock/API Toggle
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

async function getCourses(page = 1): Promise<PagedCourses> {
  const useMocks = import.meta.env.VITE_USE_API_MOCKS === 'true';
  
  if (useMocks) {
    // Return mock data for development
    return pagedCoursesMock(page);
  }
  
  // Call real API for production
  const response = await fetch(`/api/courses?page=${page}`);
  return response.json();
}

// Usage
const courses = await getCourses(1);
console.log(courses.items); // Mock or real data based on env
```

---

### Example 3: Testing Pagination UI
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

function testPaginationDisplay() {
  // Simulate page 1
  const page1 = pagedCoursesMock(1, 10);
  console.log(page1.page); // 1
  console.log(page1.totalPages); // 1
  
  // Simulate page 2 (for future extension)
  const page2 = pagedCoursesMock(2, 10);
  console.log(page2.page); // 2
  
  // Verify pagination metadata
  console.assert(page1.totalCount === 2, 'Total count should be 2');
  console.assert(page1.items.length === 2, 'Items length should be 2');
}
```

---

### Example 4: Empty State Testing
```typescript
import { emptyCoursesMock } from '@/mocks/courses';

function CourseListWithEmpty() {
  const courses = emptyCoursesMock; // or dynamic based on API response
  
  if (courses.items.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses available</p>
        <button>Create Course</button>
      </div>
    );
  }
  
  return (
    <ul>
      {courses.items.map(course => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  );
}
```

---

### Example 5: Hook Integration with Mock Data
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

// In useCourses hook
export function useCourses(page = 1) {
  const [courses, setCourses] = React.useState<PagedCourses | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate API call delay
    const timeout = setTimeout(() => {
      if (import.meta.env.VITE_USE_API_MOCKS === 'true') {
        setCourses(pagedCoursesMock(page));
      } else {
        // Real API call
        fetchCourses(page).then(setCourses);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [page]);
  
  return { courses, loading };
}
```

---

### Example 6: Mock Data with Course Filtering
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

function getRequiredCourses() {
  const mockData = pagedCoursesMock();
  return mockData.items.filter(course => course.isRequired);
}

function getActiveCourses() {
  const mockData = pagedCoursesMock();
  return mockData.items.filter(course => course.isActive);
}

// Usage
const required = getRequiredCourses(); // [Safety Orientation]
const active = getActiveCourses(); // [Safety Orientation, Leadership Essentials]
```

---

### Example 7: Display Courses in Table
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

function CoursesTable() {
  const data = pagedCoursesMock();
  
  return (
    <table>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Required</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map(course => (
          <tr key={course.id}>
            <td>{course.title}</td>
            <td>{course.isRequired ? 'Yes' : 'No'}</td>
            <td>{course.isActive ? 'Active' : 'Inactive'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Example 8: Extending Mock Data
```typescript
import { pagedCoursesMock } from '@/mocks/courses';
import { PagedCourses } from '@/hooks/useCourses';

// Create extended mock function
export function pagedCoursesMockExtended(page = 1, pageSize = 10): PagedCourses {
  const baseMock = pagedCoursesMock(page, pageSize);
  
  // Add more mock courses
  const extendedItems = [
    ...baseMock.items,
    { id: 'mock-3', title: 'Communication Skills', isRequired: false, isActive: true },
    { id: 'mock-4', title: 'Advanced Excel', isRequired: false, isActive: false },
    { id: 'mock-5', title: 'Project Management', isRequired: true, isActive: true }
  ];
  
  // Recalculate pagination
  const totalCount = extendedItems.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = extendedItems.slice(startIndex, startIndex + pageSize);
  
  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages
  };
}
```

---

### Example 9: Mock Data in Tests
```typescript
import { render, screen } from '@testing-library/react';
import { pagedCoursesMock, emptyCoursesMock } from '@/mocks/courses';
import { CourseList } from '@/components/CourseList';

describe('CourseList Component', () => {
  it('should render courses from mock data', () => {
    const mockCourses = pagedCoursesMock();
    
    render(<CourseList courses={mockCourses.items} />);
    
    expect(screen.getByText('Mock Safety Orientation')).toBeInTheDocument();
    expect(screen.getByText('Mock Leadership Essentials')).toBeInTheDocument();
  });
  
  it('should show empty state with no courses', () => {
    render(<CourseList courses={emptyCoursesMock.items} />);
    
    expect(screen.getByText('No courses available')).toBeInTheDocument();
  });
});
```

---

### Example 10: Mock Data with Role-Based Filtering
```typescript
import { pagedCoursesMock } from '@/mocks/courses';
import { useAuth } from '@/context/AuthContext';

function CoursesPageWithAuth() {
  const { user } = useAuth();
  const mockCourses = pagedCoursesMock();
  
  // Admin sees all courses
  // Employee sees only required courses
  const filteredCourses = user?.role === 'Admin'
    ? mockCourses.items
    : mockCourses.items.filter(c => c.isRequired);
  
  return (
    <div>
      <h1>Courses ({filteredCourses.length})</h1>
      <ul>
        {filteredCourses.map(course => (
          <li key={course.id}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Example 11: Performance Testing with Mock Data
```typescript
import { pagedCoursesMock } from '@/mocks/courses';

function generateLargeMockDataset(count = 1000) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `mock-${i}`,
    title: `Course ${i}`,
    isRequired: i % 2 === 0,
    isActive: i % 3 !== 0
  }));
  
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);
  
  return {
    items: items.slice(0, pageSize),
    page: 1,
    pageSize,
    totalCount: count,
    totalPages
  };
}

// Test rendering performance
const largeDataset = generateLargeMockDataset(10000);
console.time('render-large-list');
// Render component with large dataset
console.timeEnd('render-large-list');
```

---

### Example 12: Mock Data with State Management
```typescript
import { pagedCoursesMock, emptyCoursesMock } from '@/mocks/courses';
import React from 'react';

function useMockCourses(initialPage = 1) {
  const [page, setPage] = React.useState(initialPage);
  const [courses, setCourses] = React.useState(() => pagedCoursesMock(page));
  const [loading, setLoading] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(false);
  
  const goToPage = React.useCallback((newPage: number) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mock = pagedCoursesMock(newPage);
      setCourses(mock);
      setPage(newPage);
      setIsEmpty(mock.items.length === 0);
      setLoading(false);
    }, 300);
  }, []);
  
  const reset = React.useCallback(() => {
    setCourses(emptyCoursesMock);
    setPage(1);
  }, []);
  
  return { courses, page, loading, isEmpty, goToPage, reset };
}

// Usage in component
function CoursesPagination() {
  const { courses, page, loading, goToPage } = useMockCourses();
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          <ul>
            {courses.items.map(course => (
              <li key={course.id}>{course.title}</li>
            ))}
          </ul>
          <div>
            <button onClick={() => goToPage(page - 1)}>Previous</button>
            <span>Page {page} of {courses.totalPages}</span>
            <button onClick={() => goToPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Integration with Development Workflow

### .env.development Setup
```bash
# .env.development
VITE_USE_API_MOCKS=true
```

### .env.production Setup
```bash
# .env.production
VITE_USE_API_MOCKS=false
```

### Conditional API Service
```typescript
// services/courseService.ts
import { pagedCoursesMock } from '@/mocks/courses';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCKS = import.meta.env.VITE_USE_API_MOCKS === 'true';

export async function fetchCourses(page = 1, pageSize = 10) {
  if (USE_MOCKS) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return pagedCoursesMock(page, pageSize);
  }
  
  const response = await fetch(
    `${API_URL}/courses?page=${page}&pageSize=${pageSize}`
  );
  return response.json();
}
```

---

## Extending Mock Data

### Adding More Courses
```typescript
// mocks/courses.ts - Extended version

export const allMockCourses = [
  { id: 'mock-1', title: 'Safety Orientation', isRequired: true, isActive: true },
  { id: 'mock-2', title: 'Leadership Essentials', isRequired: false, isActive: true },
  { id: 'mock-3', title: 'Communication Skills', isRequired: false, isActive: true },
  { id: 'mock-4', title: 'Advanced Excel', isRequired: false, isActive: false },
  { id: 'mock-5', title: 'Project Management', isRequired: true, isActive: true },
  { id: 'mock-6', title: 'Customer Service', isRequired: true, isActive: true },
  { id: 'mock-7', title: 'Data Analytics', isRequired: false, isActive: true },
  { id: 'mock-8', title: 'Cloud Computing', isRequired: false, isActive: false }
];

export function pagedCoursesMockExtended(page = 1, pageSize = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: allMockCourses.slice(startIndex, endIndex),
    page,
    pageSize,
    totalCount: allMockCourses.length,
    totalPages: Math.ceil(allMockCourses.length / pageSize)
  };
}
```

---

## Development vs Production

### Development Workflow
1. Set `VITE_USE_API_MOCKS=true` in `.env.development`
2. Components use mock data from `pagedCoursesMock()`
3. Rapid development without backend dependencies
4. Easy state and UI testing

### Production Workflow
1. Set `VITE_USE_API_MOCKS=false` in `.env.production`
2. Components fetch real data from API
3. Production backend provides actual course data
4. Mock files remain in codebase for reference

---

## Testing Patterns

### Test 1: Verify Mock Data Structure
```typescript
import { pagedCoursesMock, emptyCoursesMock } from '@/mocks/courses';

describe('Mock Courses Data', () => {
  it('should have correct structure', () => {
    const mock = pagedCoursesMock();
    
    expect(mock).toHaveProperty('items');
    expect(mock).toHaveProperty('page', 1);
    expect(mock).toHaveProperty('pageSize', 10);
    expect(mock).toHaveProperty('totalCount');
    expect(mock).toHaveProperty('totalPages');
  });
});
```

---

### Test 2: Verify Mock Data Content
```typescript
it('should contain sample courses', () => {
  const mock = pagedCoursesMock();
  
  expect(mock.items.length).toBe(2);
  expect(mock.items[0].id).toBe('mock-1');
  expect(mock.items[0].title).toContain('Safety');
  expect(mock.items[0].isRequired).toBe(true);
});
```

---

### Test 3: Empty Mock Verification
```typescript
it('should provide empty mock', () => {
  expect(emptyCoursesMock.items.length).toBe(0);
  expect(emptyCoursesMock.totalCount).toBe(0);
  expect(emptyCoursesMock.totalPages).toBe(0);
});
```

---

## Performance Considerations

### Mock Data Caching
```typescript
let cachedMock: PagedCourses | null = null;

export function pagedCoursesMockCached(page = 1, pageSize = 10): PagedCourses {
  if (!cachedMock) {
    cachedMock = pagedCoursesMock(page, pageSize);
  }
  return cachedMock;
}
```

---

### Lazy Loading Pattern
```typescript
export function pagedCoursesMockLazy(page = 1, pageSize = 10): Promise<PagedCourses> {
  return new Promise(resolve => {
    // Simulate network latency
    setTimeout(() => {
      resolve(pagedCoursesMock(page, pageSize));
    }, Math.random() * 1000 + 500);
  });
}
```

---

## Related Documentation

- [useCourses Hook Documentation](../hooks/) - Uses mock data
- [Courses Controller](../pages/) - Displays course data
- [validators.ts Documentation](validators_doc.md) - Related utilities

---

## Common Pitfalls

### ❌ Pitfall 1: Hardcoding Mock Usage in Production
```typescript
// DON'T DO THIS
if (condition) {
  const data = pagedCoursesMock(); // Always uses mock!
}
```

### ✅ Solution
```typescript
// DO THIS - Use environment variable
if (import.meta.env.VITE_USE_API_MOCKS) {
  const data = pagedCoursesMock();
} else {
  const data = await fetchFromAPI();
}
```

---

### ❌ Pitfall 2: Not Updating Mock When API Changes
```typescript
// DON'T DO THIS - Mock becomes stale
// Keep mocks in sync with actual API contracts
```

### ✅ Solution
```typescript
// DO THIS - Maintain mock consistency
// Update mock data whenever API schema changes
// Document breaking changes
```

---

## Future Enhancements

1. Factory function for custom mock data
2. Faker.js integration for realistic data generation
3. Mock data scenarios (success, error, loading)
4. API delay simulation options
5. Response caching strategy

---

## Metadata

| Property | Value |
|----------|-------|
| **File Size** | ~15 lines |
| **Complexity** | Low |
| **External Dependencies** | None (uses internal types) |
| **Last Reviewed** | January 24, 2026 |
| **Status** | Active - Development/Testing |

---

*Documentation generated for AKR documentation system. See related files for complete mock data documentation.*
