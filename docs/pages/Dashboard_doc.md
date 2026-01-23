# Dashboard Page Documentation

## Overview

**File:** `src/pages/Dashboard.tsx`  
**Type:** React Page Component  
**Route:** `/dashboard`  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Personal training dashboard displaying user-specific enrollment data, training status, and course completion tracking. Provides at-a-glance overview of active, completed, and required courses with actionable insights.

### Key Features
- Personal enrollment tracking
- Real-time training statistics
- Required vs optional course indicators
- Status-based course actions (Continue/Certificate)
- Data enrichment from multiple sources
- Empty state with call-to-action
- Responsive statistics cards

---

## Component Signature

```typescript
function Dashboard(): JSX.Element
```

### No Props
Page-level component rendered by React Router.

---

## State Management

### External State (Hooks)
```typescript
const { user } = useAuth();
const { data: enrollmentsData, loading: loadingEnrollments } = useEnrollments(1, 100);
const { data: coursesData, loading: loadingCourses } = useCourses({ pageSize: 100 });
```

### Computed State
- `courseMap` - Map of courseId → Course data (memoized)
- `myEnrollments` - Filtered and enriched enrollment data (memoized)
- `stats` - Training statistics (active, completed, required, expiring)

---

## Data Structures

### MyEnrollmentRow
```typescript
interface MyEnrollmentRow {
  enrollmentId: string;
  courseTitle: string;
  isRequired: boolean;
  status: string;
  enrolledDate: string;
  completedDate: string | null;
  daysUntilExpiration: number | null;  // TODO: Calculate
}
```

---

## Data Flow

```
useEnrollments() → enrollmentsData
        ↓
useCourses() → coursesData
        ↓
courseMap (Map<courseId, Course>)
        ↓
myEnrollments (enriched data)
        ↓
    ┌───────┴────────┐
    ↓                ↓
Statistics      Table Display
```

---

## Statistics Cards

### Calculated Metrics
| Metric | Calculation | Color |
|--------|-------------|-------|
| **In Progress** | `status === 'ACTIVE'` | Blue (`#3b82f6`) |
| **Completed** | `status === 'COMPLETED'` | Green (`#10b981`) |
| **Required Courses** | `isRequired === true` | Amber (`#f59e0b`) |
| **Expiring Soon** | TODO: based on validity | Red (`#ef4444`) |

---

## Status Badge Mapping

```typescript
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
```

---

## Table Columns

### Column Definitions
| ID | Header | Accessor | Description |
|----|--------|----------|-------------|
| `course` | Course | Course title + required badge | Displays course name with required indicator |
| `status` | Status | StatusBadge component | Color-coded status badge |
| `enrolled` | Enrolled Date | Formatted date | When user enrolled |
| `completed` | Completed Date | Formatted date or dash | Completion timestamp |
| `expiration` | Days to Expire | Number + "days" | Days until expiration (TODO) |
| `actions` | Actions | Conditional buttons | Continue/Certificate based on status |

---

## Usage Examples

### Basic Rendering
```typescript
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
```

---

### Data Enrichment Pattern
```typescript
const courseMap = useMemo(() => {
  if (!coursesData?.items) return new Map();
  return new Map(coursesData.items.map(c => [c.id, c]));
}, [coursesData]);

const myEnrollments = useMemo(() => {
  if (!enrollmentsData?.items || !user) return [];
  
  return enrollmentsData.items
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
        daysUntilExpiration: null
      };
    })
    .filter(e => e !== null);
}, [enrollmentsData, courseMap, user]);
```

---

### Statistics Calculation
```typescript
const stats = useMemo(() => {
  const active = myEnrollments.filter(e => 
    e.status.toUpperCase() === 'ACTIVE'
  ).length;
  
  const completed = myEnrollments.filter(e => 
    e.status.toUpperCase() === 'COMPLETED'
  ).length;
  
  const required = myEnrollments.filter(e => 
    e.isRequired
  ).length;
  
  const expiringSoon = 0; // TODO: Calculate based on expiration dates
  
  return { active, completed, required, expiringSoon };
}, [myEnrollments]);
```

---

### Empty State Handling
```typescript
{myEnrollments.length === 0 ? (
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
```

---

### Action Buttons Based on Status
```typescript
{
  id: 'actions',
  header: 'Actions',
  accessor: (r: MyEnrollmentRow) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {r.status.toUpperCase() === 'ACTIVE' && (
        <Button
          variant="primary"
          onClick={() => console.log('Continue training', r.enrollmentId)}
        >
          Continue
        </Button>
      )}
      {r.status.toUpperCase() === 'COMPLETED' && (
        <Button
          variant="secondary"
          onClick={() => console.log('View certificate', r.enrollmentId)}
        >
          Certificate
        </Button>
      )}
    </div>
  )
}
```

---

### Required Course Badge
```typescript
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
}
```

---

### Navigation to Course Catalog
```typescript
const navigate = useNavigate();

<Button variant="primary" onClick={() => navigate('/courses')}>
  Browse Available Courses
</Button>
```

---

## Integration Points

### Dependencies

#### Hooks
- `useAuth()` - Get current user information
- `useEnrollments()` - Fetch user's enrollments (page 1, 100 items)
- `useCourses()` - Fetch all courses for enrichment (page 1, 100 items)

#### Components
- `Layout` - Main page wrapper with navigation
- `Table` - Data table display
- `StatusBadge` - Color-coded status indicators
- `Card` - Statistics containers
- `Button` - Action buttons

#### External
- `useNavigate` from react-router-dom - Navigation

### Used By
- App routing (`/dashboard`)
- Default landing page after login
- Redirected from root path `/`

---

## UI Layout Structure

```
Layout
└── Container (flex column, gap 1.5rem)
    ├── Header
    │   ├── <h1>My Training Dashboard</h1>
    │   └── <p>Track your training progress...</p>
    │
    ├── Statistics Grid (4 cards)
    │   ├── In Progress (blue)
    │   ├── Completed (green)
    │   ├── Required Courses (amber)
    │   └── Expiring Soon (red)
    │
    ├── My Training Courses Card
    │   └── Table or Empty State
    │
    └── Quick Actions (2 buttons)
        ├── Browse Available Courses
        └── View All Enrollments
```

---

## TODO Items

### Expiration Tracking
```typescript
// Current: placeholder
daysUntilExpiration: null

// Planned implementation
const calculateDaysUntilExpiration = (
  completedDate: string | null,
  validityMonths?: number
): number | null => {
  if (!completedDate || !validityMonths) return null;
  
  const completed = new Date(completedDate);
  const expiration = new Date(completed);
  expiration.setMonth(expiration.getMonth() + validityMonths);
  
  const today = new Date();
  const daysRemaining = Math.ceil(
    (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysRemaining;
};
```

### User Filtering
```typescript
// Current: no filtering (POC)
// Planned: filter by user ID

const myEnrollments = enrollmentsData.items
  .filter(e => e.userId === user.sub) // Add filtering
  .map(enrollment => {
    // ... enrichment logic
  });
```

### Action Handlers
```typescript
// Current: console.log placeholders
onClick={() => console.log('Continue training', r.enrollmentId)}

// Planned: actual navigation/actions
onClick={() => navigate(`/courses/${r.courseId}/learn`)}
onClick={() => downloadCertificate(r.enrollmentId)}
```

---

## Performance Considerations

### Data Fetching
- Fetches 100 enrollments and 100 courses upfront
- No pagination for dashboard (shows all user's data)
- Consider virtual scrolling if users have 100+ enrollments

### Memoization
All expensive computations are memoized:
- `courseMap` - Only recomputes when coursesData changes
- `myEnrollments` - Only recomputes when enrollmentsData, courseMap, or user changes
- `stats` - Only recomputes when myEnrollments changes
- `columns` - Memoized with empty dependency array (static definition)

### Optimization Tips
```typescript
// Avoid recalculating on every render
const columns = useMemo(() => [ /* ... */ ], []); // ✅ Good

// Don't create new objects on every render
const columns = [ /* ... */ ]; // ❌ Bad (in render)
```

---

## Error Handling

### Loading States
```typescript
const loading = loadingEnrollments || loadingCourses;

{loading ? (
  <p>Loading your training data...</p>
) : (
  // Render data
)}
```

### Empty Data
```typescript
{myEnrollments.length === 0 && (
  <div>
    <p>You haven't enrolled in any courses yet.</p>
    <Button onClick={() => navigate('/courses')}>
      Browse Course Catalog
    </Button>
  </div>
)}
```

### Missing Course Data
```typescript
const course = courseMap.get(enrollment.courseId);
if (!course) return null; // Skip enrollments without course data
```

---

## Testing

### Example Tests
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import * as hooks from '../hooks/useEnrollments';
import * as courseHooks from '../hooks/useCourses';
import * as authHooks from '../context/AuthContext';

jest.mock('../hooks/useEnrollments');
jest.mock('../hooks/useCourses');
jest.mock('../context/AuthContext');

describe('Dashboard', () => {
  beforeEach(() => {
    (authHooks.useAuth as jest.Mock).mockReturnValue({
      user: { sub: 'u1', email: 'test@example.com', role: 'Employee' }
    });
  });

  it('displays statistics cards', () => {
    (hooks.useEnrollments as jest.Mock).mockReturnValue({
      data: {
        items: [
          { id: 'e1', courseId: 'c1', status: 'ACTIVE', enrolledUtc: '2026-01-01' },
          { id: 'e2', courseId: 'c2', status: 'COMPLETED', enrolledUtc: '2026-01-01', completedUtc: '2026-01-15' }
        ]
      },
      loading: false
    });
    
    (courseHooks.useCourses as jest.Mock).mockReturnValue({
      data: {
        items: [
          { id: 'c1', title: 'Course 1', isRequired: true },
          { id: 'c2', title: 'Course 2', isRequired: false }
        ]
      },
      loading: false
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('1')).toBeInTheDocument(); // Required
  });

  it('shows empty state when no enrollments', () => {
    (hooks.useEnrollments as jest.Mock).mockReturnValue({
      data: { items: [] },
      loading: false
    });
    
    (courseHooks.useCourses as jest.Mock).mockReturnValue({
      data: { items: [] },
      loading: false
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/You haven't enrolled/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Course Catalog/i)).toBeInTheDocument();
  });
});
```

---

## Accessibility

### Semantic HTML
- Proper heading hierarchy (`<h1>`, `<h2>`)
- Card containers use semantic `<section>` elements
- Table uses `<table>` with proper ARIA

### ARIA Labels
```typescript
<Button
  aria-label={`Continue ${r.courseTitle}`}
  onClick={() => console.log('Continue training', r.enrollmentId)}
>
  Continue
</Button>
```

### Color Contrast
All text meets WCAG AA standards:
- Statistics: Dark text on light backgrounds
- Status badges: High contrast colors

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- ES6 (Map, arrow functions, destructuring)
- React 18+ with Hooks
- CSS Grid

---

## Related Documentation
- [useEnrollments Hook](../hooks/useEnrollments_doc.md) - Fetch enrollment data
- [useCourses Hook](../hooks/useCourses_doc.md) - Fetch course data
- [Table Component](../components/Table_doc.md) - Data table display
- [StatusBadge Component](../components/StatusBadge_doc.md) - Status indicators
- [Card Component](../components/Card_doc.md) - Statistics containers

---

## Maintenance & Support

**Owner:** Frontend Team  
**Tech Lead:** melvin.reyes@emerson.com  
**Last Review:** January 24, 2026

---

<!-- AKR Documentation Metadata -->
<!-- Generated: 2026-01-24 -->
<!-- Template: page-standard -->
<!-- AI-Generated: true -->
