# Enrollments Page Documentation

## Overview

**File:** `src/pages/Enrollments.tsx`  
**Type:** React Page Component  
**Route:** `/enrollments` (Admin Interface)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Administrative enrollment management interface providing comprehensive tracking and control of user course enrollments. Enables creation, status updates, and deletion of enrollments with automatic data enrichment from users and courses APIs. Displays enrollment statistics (total, active, completed) with real-time status management.

### Key Features
- Paginated enrollment list with data enrichment from 3 sources
- Create new enrollments via user and course dropdowns
- Status management (Complete, Cancel, Delete actions)
- Automatic data enrichment (course names from courseId, user info from userId)
- Statistics cards (total, active, completed enrollments)
- Status-based conditional rendering of action buttons
- Table display with user and course information
- Real-time list refresh after operations
- Comprehensive error handling and user feedback

---

## Component Signature

```typescript
function Enrollments(): JSX.Element
```

### No Props
Page-level component rendered by React Router.

---

## State Management

### External State (Hooks)
```typescript
const { data: enrollmentsData, loading: loadingEnrollments, error, refetch } = useEnrollments(page, pageSize);
const { data: coursesData, loading: loadingCourses } = useCourses({ page: 1, pageSize: 100 });
const { data: usersData, loading: loadingUsers } = useUsers(1, 100);
```

### Local State
```typescript
const [page, setPage] = useState(1);
const pageSize = 10;  // Pagination size for enrollments

// Create modal
const [showCreateModal, setShowCreateModal] = useState(false);
const [createForm, setCreateForm] = useState({ userId: '', courseId: '' });
const [isCreating, setIsCreating] = useState(false);
const [createError, setCreateError] = useState<string | null>(null);

// Delete operation tracking
const [isDeleting, setIsDeleting] = useState<string | null>(null);

// Combined loading state
const loading = loadingEnrollments || loadingCourses || loadingUsers;
```

### Computed State (Lookup Maps)
```typescript
const courseMap = useMemo(() => {
  if (!coursesData?.items) return new Map();
  return new Map(coursesData.items.map(c => [c.id, c]));
}, [coursesData]);

const userMap = useMemo(() => {
  if (!usersData?.items) return new Map();
  return new Map(usersData.items.map(u => [u.id, u]));
}, [usersData]);

// Enriched enrollment data
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
```

---

## Data Structures

### EnrollmentRow (Display Format - Enriched)
```typescript
interface EnrollmentRow {
  id: string;
  courseId: string;
  courseName: string;           // Enriched from courseMap
  userId: string;
  userEmail: string;            // Enriched from userMap
  userFullName: string;         // Enriched from userMap
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}
```

### API Enrollment (Raw Data)
```typescript
interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}
```

### API Response (useEnrollments)
```typescript
{
  items: Enrollment[],
  totalCount: number,
  totalPages: number
}
```

### Create Enrollment Form
```typescript
interface CreateEnrollmentForm {
  userId: string;      // Selected from dropdown
  courseId: string;    // Selected from dropdown
}
```

---

## Data Enrichment Pattern

### Three-Source Integration
```typescript
// Source 1: Enrollments list
enrollmentsData.items.map(enrollment => {
  // Source 2: Courses data
  const course = courseMap.get(enrollment.courseId);
  
  // Source 3: Users data
  const user = userMap.get(enrollment.userId);
  
  // Combine into enriched row
  return {
    ...enrollment,
    courseName: course?.title || 'Unknown Course',
    userEmail: user?.email || 'Unknown',
    userFullName: user?.fullName || 'Unknown User',
  };
});
```

### Lookup Maps for O(1) Lookup
```typescript
// Instead of array.find() for each enrollment (O(n*m) complexity)
// Use Map for direct lookup (O(1) complexity)

const courseMap = new Map(coursesData.items.map(c => [c.id, c]));
// { 'course-1': { id, title, ... }, 'course-2': { ... } }

const userMap = new Map(usersData.items.map(u => [u.id, u]));
// { 'user-1': { id, email, fullName, ... }, 'user-2': { ... } }

// Lookup: courseMap.get('course-1')  // O(1) instant access
```

---

## CRUD Operations

### CREATE - Add New Enrollment
```typescript
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
```

**Trigger:** "+ Create Enrollment" button  
**Modal:** Two required dropdowns (User, Course)  
**Success:** Modal closes, list refreshes

### READ - Paginated Enriched List
```typescript
// Fetch from three endpoints
const { data: enrollmentsData } = useEnrollments(page, pageSize);
const { data: coursesData } = useCourses({ page: 1, pageSize: 100 });
const { data: usersData } = useUsers(1, 100);

// Enrich in useMemo
const data: EnrollmentRow[] = useMemo(() => {
  if (!enrollmentsData?.items) return [];
  
  return enrollmentsData.items.map(enrollment => {
    const course = courseMap.get(enrollment.courseId);
    const user = userMap.get(enrollment.userId);
    
    return {
      ...enrollment,
      courseName: course?.title || 'Unknown Course',
      userEmail: user?.email || 'Unknown',
      userFullName: user?.fullName || 'Unknown User',
    };
  });
}, [enrollmentsData, courseMap, userMap]);

// Display in table
<Table columns={columns} data={data} />
```

**Display:** Table with 10 enriched enrollments per page  
**Enrichment:** Course title and user info combined on-the-fly

### UPDATE - Change Enrollment Status
```typescript
// Status transitions available based on current status

const handleCompleteEnrollment = async (enrollmentId: string) => {
  if (!confirm('Mark this enrollment as completed?')) return;

  try {
    await api.patch(`/api/enrollments/${enrollmentId}/status`, {
      status: 'COMPLETED'
    });
    refetch();
  } catch (err: any) {
    alert(`Error: ${err.response?.data?.message || err.message}`);
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
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};
```

**Conditional Display:** Buttons only show for ACTIVE/PENDING status  
**Confirmation:** Require user confirmation before status change

### DELETE - Remove Enrollment
```typescript
const handleDeleteEnrollment = async (enrollmentId: string) => {
  if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
    return;
  }

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
```

**Trigger:** Delete button in actions column  
**Confirmation:** Browser confirm dialog  
**Loading State:** Button shows "Deleting..." during operation  
**Effect:** Enrollment removed from table after success

---

## Modal Form Pattern

### Create Enrollment Modal
```tsx
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
        {/* Form fields */}
      </form>
    </div>
  </div>
)}
```

### Form Fields
| Field | Type | Required | Data Source |
|-------|------|----------|-------------|
| **User** | select | ✓ | Dropdown populated from usersData |
| **Course** | select | ✓ | Dropdown populated from coursesData |

### Dropdown Population
```tsx
<select
  value={createForm.userId}
  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
  required
>
  <option value="">Select a user...</option>
  {usersData?.items.map(user => (
    <option key={user.id} value={user.id}>
      {user.fullName} ({user.email})  {/* Display name and email for clarity */}
    </option>
  ))}
</select>

<select
  value={createForm.courseId}
  onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
  required
>
  <option value="">Select a course...</option>
  {coursesData?.items.map(course => (
    <option key={course.id} value={course.id}>
      {course.title}  {/* Display course title */}
    </option>
  ))}
</select>
```

---

## Table Columns Definition

```typescript
const columns = useMemo(() => [
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
], [isDeleting]);
```

### Column Features
| Column | Type | Purpose | Notes |
|--------|------|---------|-------|
| User | Stacked Text | User identifier | Name + email in compact format |
| Course | Text | Course identifier | Enriched course title |
| Status | Badge | Enrollment state | Color-coded badge |
| Enrolled | Date | Enrollment date | Formatted as MM/DD/YYYY |
| Completed | Date | Completion date | Dash if not completed |
| Actions | Buttons | Status transitions | Conditional based on status |

---

## Status Management

### Status Mapping
```typescript
const getStatusTone = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case 'COMPLETED':
      return 'success';        // Green badge
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'info';           // Blue badge
    case 'DROPPED':
    case 'WITHDRAWN':
    case 'CANCELLED':
      return 'warning';        // Yellow badge
    case 'FAILED':
    case 'EXPIRED':
      return 'danger';         // Red badge
    default:
      return 'info';
  }
};
```

### Status States
| Status | Color | Tone | Actions Available |
|--------|-------|------|-------------------|
| **ACTIVE/PENDING** | Blue/Yellow | info/warning | Complete, Cancel |
| **COMPLETED** | Green | success | Delete only |
| **CANCELLED** | Yellow | warning | Delete only |
| **EXPIRED/FAILED** | Red | danger | Delete only |

### Conditional Action Buttons
```typescript
// Only show Complete & Cancel for ACTIVE/PENDING statuses
{(r.status.toUpperCase() === 'ACTIVE' || r.status.toUpperCase() === 'PENDING') && (
  <>
    <Button onClick={() => handleCompleteEnrollment(r.id)}>Complete</Button>
    <Button onClick={() => handleCancelEnrollment(r.id)}>Cancel</Button>
  </>
)}

// Always show Delete button
<Button
  disabled={isDeleting === r.id}
  onClick={() => handleDeleteEnrollment(r.id)}
>
  {isDeleting === r.id ? 'Deleting...' : 'Delete'}
</Button>
```

---

## Statistics Cards

### Displayed Metrics
```tsx
<Card>
  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Enrollments</div>
  <div style={{ fontSize: '2rem', fontWeight: 700 }}>
    {enrollmentsData?.totalCount || 0}
  </div>
</Card>

<Card>
  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active</div>
  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
    {data.filter(e => 
      e.status.toUpperCase() === 'ACTIVE' || 
      e.status.toUpperCase() === 'PENDING'
    ).length}
  </div>
</Card>

<Card>
  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
    {data.filter(e => e.status.toUpperCase() === 'COMPLETED').length}
  </div>
</Card>
```

| Card | Formula | Color | Notes |
|------|---------|-------|-------|
| **Total** | API totalCount | Gray | All enrollments in catalog |
| **Active** | Filter status = ACTIVE/PENDING | Blue | Current page only |
| **Completed** | Filter status = COMPLETED | Green | Current page only |

---

## Usage Examples

### 1. Create New Enrollment
```typescript
// User clicks "+ Create Enrollment"
const handleCreateEnrollment = () => {
  setShowCreateModal(true);
  setCreateForm({ userId: '', courseId: '' });
  setCreateError(null);
};

// Modal opens with two dropdowns
// User selects: John Doe from User dropdown
// User selects: "Advanced JavaScript" from Course dropdown
// User clicks Create

const handleCreateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsCreating(true);

  try {
    // API call with IDs
    await api.post('/api/enrollments', {
      userId: 'user-123',
      courseId: 'course-456'
    });
    setShowCreateModal(false);
    refetch();  // Refresh list with new enrollment
  } catch (err: any) {
    setCreateError('User already enrolled in this course');  // Example error
  } finally {
    setIsCreating(false);
  }
};
```

### 2. Complete an Enrollment
```typescript
// Table shows enrollment:
// User: John Doe (john@co.com)
// Course: Advanced JavaScript
// Status: ACTIVE (blue badge)
// Buttons: [Complete] [Cancel] [Delete]

const handleCompleteEnrollment = async (enrollmentId: string) => {
  if (!confirm('Mark this enrollment as completed?')) return;

  try {
    await api.patch(`/api/enrollments/enr-789/status`, {
      status: 'COMPLETED'
    });
    refetch();  // Table refreshes
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
};

// After completion:
// Status changes to: COMPLETED (green badge)
// Buttons now only show: [Delete]
// Completed Date field populates with today's date
```

### 3. Cancel an Enrollment
```typescript
// Enrollment is still ACTIVE
// User clicks "Cancel" button

const handleCancelEnrollment = async (enrollmentId: string) => {
  if (!confirm('Cancel this enrollment?')) return;

  try {
    await api.patch(`/api/enrollments/enr-789/status`, {
      status: 'CANCELLED'
    });
    refetch();
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
};

// After cancellation:
// Status changes to: CANCELLED (yellow badge)
// Buttons now only show: [Delete]
// User is no longer actively enrolled
```

### 4. Delete an Enrollment
```typescript
// User clicks "Delete" button on any enrollment

const handleDeleteEnrollment = async (enrollmentId: string) => {
  if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
    return;  // User cancelled
  }

  setIsDeleting('enr-789');  // Mark as loading
  try {
    await api.delete(`/api/enrollments/enr-789`);
    refetch();  // Enrollment removed from table
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  } finally {
    setIsDeleting(null);
  }
};

// Button shows "Deleting..." during operation
// After deletion, enrollment no longer appears in table
```

### 5. Filter Statistics (Current Page vs Total)
```typescript
// API returns:
// Total enrollments in system: 157

// Current page (page 1, 10 per page):
// [ACTIVE, ACTIVE, COMPLETED, CANCELLED, ACTIVE, ACTIVE, ACTIVE, COMPLETED, ACTIVE, PENDING]

// Statistics displayed:
// Total: 157 (from API)
// Active: 6 (ACTIVE + PENDING from current page = 6)
// Completed: 2 (from current page)

// Important: Statistics reflect CURRENT PAGE, not entire catalog
// This is intentional for at-a-glance overview of visible data
```

### 6. Enrich Enrollment Data
```typescript
// Raw API data:
const enrollmentRaw = {
  id: 'enr-123',
  userId: 'user-456',
  courseId: 'course-789',
  status: 'ACTIVE',
  enrolledUtc: '2026-01-15T10:00:00Z',
  completedUtc: null
};

// Create lookup maps
const courseMap = new Map([['course-789', { id: 'course-789', title: 'JavaScript Basics' }]]);
const userMap = new Map([['user-456', { id: 'user-456', email: 'john@co.com', fullName: 'John Doe' }]]);

// Enrich using maps (O(1) lookup):
const enriched = {
  ...enrollmentRaw,
  courseName: courseMap.get('course-789').title,  // 'JavaScript Basics'
  userEmail: userMap.get('user-456').email,       // 'john@co.com'
  userFullName: userMap.get('user-456').fullName, // 'John Doe'
};

// Result: { id, userId, courseId, status, enrolledUtc, completedUtc, courseName, userEmail, userFullName }
```

### 7. Navigate Paginated Enrollments
```typescript
// Initial render - page 1
const [page, setPage] = useState(1);
const { data: enrollmentsData } = useEnrollments(1, 10);
// Displays enrollments 1-10

// User clicks "Next"
setPage(2);
// Fetches enrollments 11-20

// Pagination shows:
// [Previous] Page 2 of 8 (75 total) [Next]

// User clicks "Previous"
setPage(1);
// Back to enrollments 1-10
```

### 8. Handle Create Error - Duplicate Enrollment
```typescript
// User tries to enroll John Doe in JavaScript again
// He's already enrolled

const handleCreateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/api/enrollments', {
      userId: 'user-123',
      courseId: 'course-456'
    });
  } catch (err: any) {
    // Server returns 409 Conflict
    setCreateError(err.response?.data?.message);
    // 'User already enrolled in this course'
  } finally {
    setIsCreating(false);
  }
};

// Error displayed in red box in modal
// User must select different user or course
```

### 9. Format Dates in Table
```typescript
const columns = useMemo(() => [
  {
    id: 'enrolled',
    header: 'Enrolled Date',
    accessor: (r: EnrollmentRow) => new Date(r.enrolledUtc).toLocaleDateString()
    // '2026-01-15T10:00:00Z' becomes '1/15/2026'
  },
  {
    id: 'completed',
    header: 'Completed Date',
    accessor: (r: EnrollmentRow) => 
      r.completedUtc ? new Date(r.completedUtc).toLocaleDateString() : '—'
    // null/undefined becomes '—' dash character
  }
], []);
```

### 10. User Stacked Display in Table
```typescript
{
  id: 'user',
  header: 'User',
  accessor: (r: EnrollmentRow) => (
    <div>
      <div style={{ fontWeight: 500 }}>{r.userFullName}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{r.userEmail}</div>
    </div>
  )
}

// Renders as:
// John Doe
// john@example.com
// (Name bold, email gray and smaller)
```

### 11. Conditional Action Buttons Based on Status
```typescript
// ACTIVE enrollment shows both action buttons:
<Button onClick={() => handleCompleteEnrollment(r.id)}>Complete</Button>
<Button onClick={() => handleCancelEnrollment(r.id)}>Cancel</Button>
<Button onClick={() => handleDeleteEnrollment(r.id)}>Delete</Button>

// COMPLETED enrollment shows delete only:
<Button onClick={() => handleDeleteEnrollment(r.id)}>Delete</Button>

// Status checked: if (status === 'ACTIVE' || status === 'PENDING')
```

### 12. Multi-Source Data Loading
```typescript
// Three concurrent API calls
const { data: enrollmentsData, loading: loadingEnrollments } = useEnrollments(1, 10);
const { data: coursesData, loading: loadingCourses } = useCourses({ page: 1, pageSize: 100 });
const { data: usersData, loading: loadingUsers } = useUsers(1, 100);

// Combined loading state
const loading = loadingEnrollments || loadingCourses || loadingUsers;

// Page shows loading message until ALL three are done
{loading ? (
  <p>Loading enrollments...</p>
) : (
  <Table columns={columns} data={data} />
)}

// Only then enriches data and displays table
```

---

## Integration Points

### API Service
```typescript
import { api } from '../services/api';

// Available methods:
// - api.post('/api/enrollments', payload) → Promise<Enrollment>
// - api.patch(`/api/enrollments/${id}/status`, { status }) → Promise<Enrollment>
// - api.delete(`/api/enrollments/${id}`) → Promise<void>
// - useEnrollments hook handles GET requests
```

### Component Dependencies
```typescript
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useEnrollments } from '../hooks/useEnrollments';
import { useCourses } from '../hooks/useCourses';
import { useUsers } from '../hooks/useUsers';
```

### Data Flow Diagram
```
useEnrollments() ────┐
useCourses()     ────┼──→ courseMap (lookup)
useUsers()       ────┼──→ userMap (lookup)
                     ↓
              Enrich enrollments
                     ↓
              EnrollmentRow[]
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
     Statistics           Table display
     cards               with actions
```

---

## UI Layout Structure

```
┌─────────────────────────────────────────┐
│          Enrollments              [+New]  │
└─────────────────────────────────────────┘

┌────────────┬──────────┬───────────┐
│   Total    │  Active  │ Completed │
│     157    │    45    │     89    │
└────────────┴──────────┴───────────┘

┌────────────────────────────────────────┐
│         All Enrollments                 │
├────────────────────────────────────────┤
│ User       │ Course │ Status │ Actions  │
├────────────────────────────────────────┤
│ John Doe   │ JS     │ ACTIVE │ [Complete]│
│ john@co.com│ Basics │        │ [Cancel]  │
│            │        │        │ [Delete]  │
├────────────────────────────────────────┤
│ Jane Smith │ Safety │COMPLETE│ [Delete]  │
│ jane@co.com│Training│        │           │
├────────────────────────────────────────┤
│ [Prev] Page 1 of 8 (75 total) [Next]    │
└────────────────────────────────────────┘

(Modal when creating)
┌────────────────────────────────────────┐
│     Create New Enrollment               │
│                                         │
│ User: [John Doe (john@co.com)]         │
│ Course: [JavaScript Basics]            │
│                     [Cancel] [Create]   │
└────────────────────────────────────────┘
```

---

## Error Handling

### Duplicate Enrollment Error
```typescript
try {
  await api.post('/api/enrollments', {
    userId: 'user-123',
    courseId: 'course-456'
  });
} catch (err: any) {
  // 409 Conflict response
  setCreateError('User already enrolled in this course');
}
```

### Status Update Error
```typescript
const handleCompleteEnrollment = async (enrollmentId: string) => {
  try {
    await api.patch(`/api/enrollments/${enrollmentId}/status`, {
      status: 'COMPLETED'
    });
  } catch (err: any) {
    const message = err.response?.data?.message || err.message;
    alert(`Error: ${message}`);
    // 'Cannot complete inactive enrollment'
  }
};
```

### Delete Confirmation & Error
```typescript
if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
  return;  // User cancelled
}

setIsDeleting(enrollmentId);
try {
  await api.delete(`/api/enrollments/${enrollmentId}`);
  refetch();
} catch (err: any) {
  alert(`Error: ${err.response?.data?.message || err.message}`);
  // 'Enrollment not found'
} finally {
  setIsDeleting(null);
}
```

### Modal Error Display
```tsx
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
```

---

## Performance Considerations

### Lookup Maps vs Array.find()
```typescript
// ❌ SLOW: Array.find for each enrollment (O(n*m))
const enrichedSlow = enrollments.map(enr => ({
  ...enr,
  courseName: courses.find(c => c.id === enr.courseId)?.title,
  userEmail: users.find(u => u.id === enr.userId)?.email,
}));

// ✓ FAST: Map lookup for each enrollment (O(n))
const courseMap = new Map(courses.map(c => [c.id, c]));
const userMap = new Map(users.map(u => [u.id, u]));

const enrichedFast = enrollments.map(enr => ({
  ...enr,
  courseName: courseMap.get(enr.courseId)?.title,
  userEmail: userMap.get(enr.userId)?.email,
}));
```

### Memoization
```typescript
// Prevent unnecessary recalculations
const data: EnrollmentRow[] = useMemo(() => {
  // Complex enrichment logic
}, [enrollmentsData, courseMap, userMap]);

const columns = useMemo(() => [
  // Column definitions
], [isDeleting]);
```

### Pagination Benefits
- Only 10 enrollments per page
- Smaller datasets for enrichment
- Faster table rendering
- Lower memory usage

---

## Testing Examples

### Unit Test - Create Modal
```typescript
describe('Enrollments - Create Modal', () => {
  it('should open modal when Create Enrollment clicked', () => {
    render(<Enrollments />);
    fireEvent.click(screen.getByText('+ Create Enrollment'));
    expect(screen.getByText('Create New Enrollment')).toBeInTheDocument();
  });

  it('should populate dropdowns with users and courses', async () => {
    render(<Enrollments />);
    fireEvent.click(screen.getByText('+ Create Enrollment'));
    
    const userSelect = screen.getByDisplayValue('Select a user...');
    await waitFor(() => {
      expect(userSelect).toHaveTextContent('John Doe');
    });
  });
});
```

### Integration Test - Create Enrollment
```typescript
describe('Enrollments - Create', () => {
  it('should create enrollment with selected user and course', async () => {
    const mockPost = jest.fn();
    jest.mock('../services/api', () => ({
      api: { post: mockPost }
    }));

    render(<Enrollments />);
    fireEvent.click(screen.getByText('+ Create Enrollment'));
    
    fireEvent.change(screen.getByDisplayValue('Select a user...'), {
      target: { value: 'user-123' }
    });
    fireEvent.change(screen.getByDisplayValue('Select a course...'), {
      target: { value: 'course-456' }
    });
    
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/enrollments', {
        userId: 'user-123',
        courseId: 'course-456'
      });
    });
  });
});
```

---

## Accessibility

### Keyboard Navigation
- Tab through dropdowns and buttons
- Enter/Space to select dropdown options
- Enter to submit form

### Screen Reader Support
```tsx
<Button
  aria-label={`Mark as complete`}
  onClick={() => handleCompleteEnrollment(r.id)}
>
  Complete
</Button>
```

### Color Contrast
- Status badges use distinct colors
- Error messages in red box with dark text
- Text meets WCAG AA standards

---

## Related Documentation

- **[useEnrollments Hook](../hooks/useEnrollments_doc.md)** - Enrollment data fetching
- **[useCourses Hook](../hooks/useCourses_doc.md)** - Course data fetching
- **[useUsers Hook](../hooks/useUsers_doc.md)** - User data fetching
- **[Button Component](../components/Button_doc.md)** - Button styling
- **[Table Component](../components/Table_doc.md)** - Table rendering
- **[StatusBadge Component](../components/StatusBadge_doc.md)** - Status indicators
- **[Card Component](../components/Card_doc.md)** - Card layout
- **[api Service](../services/api_doc.md)** - API integration

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-24 | Initial documentation |

## Author

Frontend Team | Last Updated: January 24, 2026
