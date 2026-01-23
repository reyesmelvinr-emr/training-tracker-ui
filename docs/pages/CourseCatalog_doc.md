# CourseCatalog Page Documentation

## Overview

**File:** `src/pages/CourseCatalog.tsx`  
**Type:** React Page Component  
**Route:** `/courses` (Admin Interface)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Administrative page for managing the complete course catalog. Provides comprehensive CRUD operations for courses including creation, editing, deletion, and viewing with advanced filtering. Displays course statistics (total, required, optional) and supports pagination for large course catalogs.

### Key Features
- Paginated course list with 10-item page size
- Complete CRUD operations (Create, Update, Delete)
- Modal-based form interface for course management
- Statistics cards showing course distribution
- Status indicators (Active/Inactive, Required/Optional)
- Category classification and validity period management
- Table-based course display with bulk actions
- Real-time data refresh after operations
- Error handling for API failures
- Form validation and error messaging

---

## Component Signature

```typescript
function CourseCatalog(): JSX.Element
```

### No Props
Page-level component rendered by React Router.

---

## State Management

### External State (Hooks)
```typescript
const { data: coursesData, loading, error, refetch } = useCourses({ page, pageSize });
```

### Local State
```typescript
const [page, setPage] = useState(1);
const pageSize = 10;  // Fixed pagination size

// Modal control
const [showModal, setShowModal] = useState(false);

// Form state
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
```

### Computed State
```typescript
const data: CourseRow[] = useMemo(() => {
  if (!coursesData?.items) return [];
  return coursesData.items;
}, [coursesData]);
```

---

## Data Structures

### CourseRow (Display Format)
```typescript
interface CourseRow {
  id: string;
  title: string;
  category?: string;
  validityMonths?: number;
  description?: string;
  isRequired: boolean;
  isActive: boolean;
}
```

### CourseFormData (Form Submission)
```typescript
interface CourseFormData {
  title: string;
  category: string;
  validityMonths: string;  // String input, converted to number
  description: string;
  isRequired: boolean;
  isActive: boolean;
}
```

### API Response (from useCourses)
```typescript
{
  items: CourseRow[],
  totalCount: number,
  totalPages: number
}
```

---

## CRUD Operations

### CREATE - Add New Course
```typescript
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
```

**Trigger:** "Add Course" button in header  
**Modal:** Course Form Modal appears

### READ - Paginated Course List
```typescript
// Hook fetch (auto-triggered on page change)
const { data: coursesData, loading, error, refetch } = useCourses({ page, pageSize });

// Rendered in table
<Table
  caption="All Available Courses"
  columns={columns}
  data={data}
/>
```

**Display:** Table with 10 courses per page  
**Pagination:** Previous/Next buttons with page counter

### UPDATE - Edit Existing Course
```typescript
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
```

**Trigger:** Edit button in actions column  
**Modal:** Form pre-populated with current values

### DELETE - Remove Course
```typescript
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
```

**Trigger:** Delete button in actions column  
**Confirmation:** Browser confirm dialog  
**Effect:** Refetch course list after deletion

### SUBMIT - Save Course (Create/Update)
```typescript
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
```

**Validation:** Required field (title) enforced by HTML5  
**Conversion:** validityMonths string → number  
**Nullification:** Optional fields converted to null if empty

---

## Modal Form Pattern

### Form Structure
```tsx
{showModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
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
      {/* Form content */}
    </div>
  </div>
)}
```

### Form Fields
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| **Title** | text | ✓ | '' | Course name, must be unique |
| **Category** | text | ✗ | '' | Optional classification (Safety, Technical, etc.) |
| **Validity** | number | ✗ | '' | Months until certification expires |
| **Description** | textarea | ✗ | '' | Extended course details |
| **Required** | checkbox | ✗ | false | Mandatory for all users |
| **Active** | checkbox | ✗ | true | Published/visible status |

### Error Display
```tsx
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
```

---

## Table Columns Definition

```typescript
const columns = useMemo(() => [
  {
    id: 'title',
    header: 'Course Title',
    accessor: (r: CourseRow) => r.title
  },
  {
    id: 'category',
    header: 'Category',
    accessor: (r: CourseRow) => 
      r.category || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>
  },
  {
    id: 'validity',
    header: 'Validity',
    accessor: (r: CourseRow) => 
      r.validityMonths ? `${r.validityMonths} months` : 
      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>
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
        <Button variant="primary" onClick={() => handleEditCourse(r.id)}>
          Edit
        </Button>
        <Button variant="secondary" onClick={() => handleDeleteCourse(r.id)}>
          Delete
        </Button>
      </div>
    )
  }
], [data]);
```

### Column Features
| Column | Type | Purpose |
|--------|------|---------|
| Title | Text | Course identifier |
| Category | Text | Classification/grouping |
| Validity | Duration | Certification expiry window |
| Status | Badge | Publication status |
| Required | Badge | Completion requirement |
| Actions | Buttons | Edit/Delete operations |

---

## Statistics Cards

### Displayed Metrics
```tsx
<Card>
  <div style={{ padding: '0.5rem' }}>
    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Courses</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
      {coursesData?.totalCount || 0}
    </div>
  </div>
</Card>

<Card>
  <div style={{ padding: '0.5rem' }}>
    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Required Courses</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
      {data.filter(c => c.isRequired).length}
    </div>
  </div>
</Card>

<Card>
  <div style={{ padding: '0.5rem' }}>
    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Optional Courses</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
      {data.filter(c => !c.isRequired).length}
    </div>
  </div>
</Card>
```

| Card | Value | Color | Formula |
|------|-------|-------|---------|
| **Total** | API count | Gray | coursesData.totalCount |
| **Required** | Filtered | Amber | data.filter(c => c.isRequired).length |
| **Optional** | Filtered | Blue | data.filter(c => !c.isRequired).length |

---

## Pagination Controls

### Implementation
```tsx
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
```

**Features:**
- Previous button disabled on first page
- Next button disabled on last page
- Current page and total pages displayed
- Total course count shown

---

## Usage Examples

### 1. Add New Course via Modal
```typescript
// User clicks "Add Course" button
const handleAddCourse = () => {
  setEditingCourseId(null);
  setFormData({
    title: '',
    category: 'Technical',
    validityMonths: '12',
    description: 'Advanced JavaScript training',
    isRequired: true,
    isActive: true,
  });
  setShowModal(true);
};

// User submits form
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // API call
    await coursesApi.create({
      title: 'Advanced JavaScript',
      category: 'Technical',
      validityMonths: 12,
      description: 'Advanced JavaScript training',
      isRequired: true,
      isActive: true,
    });
    await refetch();  // Refresh list
    handleCloseModal();  // Close modal
  } catch (err) {
    setFormError(err.message);
  }
};
```

### 2. Edit Existing Course
```typescript
// User clicks Edit button on course with id "course-123"
const handleEditCourse = (courseId: string) => {
  const course = data.find(c => c.id === courseId);
  setEditingCourseId('course-123');
  setFormData({
    title: 'JavaScript Basics',
    category: 'Technical',
    validityMonths: 24,
    description: 'Introduction to JavaScript',
    isRequired: true,
    isActive: true,
  });
  setShowModal(true);
};

// Form submission in edit mode
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await coursesApi.update('course-123', {
      title: 'JavaScript Fundamentals',  // Changed
      category: 'Technical',
      validityMonths: 24,
      description: 'Introduction to JavaScript',
      isRequired: true,
      isActive: true,
    });
    await refetch();
    handleCloseModal();
  } catch (err) {
    setFormError(err.message);
  }
};
```

### 3. Delete Course with Confirmation
```typescript
const handleDeleteCourse = async (courseId: string) => {
  const course = data.find(c => c.id === courseId);
  
  // Confirmation dialog
  if (!confirm(`Are you sure you want to delete course "${course.title}"?`)) {
    return;
  }

  try {
    await coursesApi.delete(courseId);
    await refetch();  // Refresh list
    // Deleted course removed from table
  } catch (err: any) {
    alert(`Failed to delete course: ${err.message}`);
  }
};
```

### 4. Navigate Paginated Course List
```typescript
// Initial render - page 1
const [page, setPage] = useState(1);
const pageSize = 10;
const { data: coursesData, loading, error, refetch } = useCourses({ page: 1, pageSize: 10 });
// Displays courses 1-10

// User clicks "Next"
const handleNextPage = () => {
  setPage(p => Math.min(coursesData.totalPages, p + 1));
  // Triggers re-fetch with page: 2
  // Displays courses 11-20
};

// User clicks "Previous"
const handlePrevPage = () => {
  setPage(p => Math.max(1, p - 1));
  // Triggers re-fetch with page: 1
  // Displays courses 1-10 again
};
```

### 5. Form Validation - Required Field
```typescript
// HTML5 validation handles required field
<input
  type="text"
  required
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
/>

// Cannot submit form without title
// Browser shows: "Please fill out this field"
```

### 6. Statistics Calculation - Required vs Optional
```typescript
// On every data update, useMemo recalculates:
const requiredCount = data.filter(c => c.isRequired).length;      // 5
const optionalCount = data.filter(c => !c.isRequired).length;     // 8

// Display in cards
<Card>Required Courses</Card>  // Shows: 5
<Card>Optional Courses</Card>  // Shows: 8
```

### 7. Form Reset on Modal Close
```typescript
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

// Next time modal opens, form is clean
```

### 8. Handle API Error in Form
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError(null);
  setFormLoading(true);

  try {
    await coursesApi.create(payload);
    await refetch();
    handleCloseModal();
  } catch (err: any) {
    // Display error message to user
    setFormError(err.response?.data?.message || err.message);
    // "Title must be unique"
    // "Invalid validity period"
  } finally {
    setFormLoading(false);
  }
};
```

### 9. Disable Form During Submission
```typescript
// While formLoading is true:
<input
  type="text"
  disabled={formLoading}  // Input disabled
/>

<Button type="submit" disabled={formLoading}>
  {formLoading ? 'Saving...' : 'Create'}  // Button text changes
</Button>

// Prevents duplicate submissions
```

### 10. Convert Validity Months (String to Number)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const payload = {
    ...formData,
    // Convert string input to number or null
    validityMonths: formData.validityMonths ? parseInt(formData.validityMonths) : null,
    category: formData.category || null,
    description: formData.description || null,
  };

  await coursesApi.create(payload);
  // API receives: { ..., validityMonths: 12, ... }
};
```

### 11. Filter Courses for Statistics
```typescript
// Data displayed in table
const data: CourseRow[] = useMemo(() => {
  if (!coursesData?.items) return [];
  return coursesData.items;  // 10 items (current page)
}, [coursesData]);

// Statistics based on current page (NOT all courses)
const requiredOnPage = data.filter(c => c.isRequired).length;
const optionalOnPage = data.filter(c => !c.isRequired).length;

// Note: Stats reflect current page, not entire catalog
// Total count from API shows complete catalog: coursesData.totalCount
```

### 12. Modal Accessibility with ARIA
```tsx
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

// Screen readers announce: "Edit Advanced JavaScript"
// Screen readers announce: "Delete Safety Training"
```

---

## Integration Points

### API Service
```typescript
import { coursesApi } from '../services/apiClient';

// Available methods:
// - coursesApi.create(payload) → Promise<Course>
// - coursesApi.update(courseId, payload) → Promise<Course>
// - coursesApi.delete(courseId) → Promise<void>
// - useCourses hook handles GET requests
```

### Component Dependencies
```typescript
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useCourses } from '../hooks/useCourses';
```

### Data Flow
```
useCourses() → coursesData
    ↓
Table columns transform CourseRow
    ↓
Statistics filter data
    ↓
Modal form submits to coursesApi
    ↓
refetch() updates useCourses
```

---

## UI Layout Structure

```
┌─────────────────────────────────────────┐
│         Course Catalog Title            │
│      "Browse and manage courses"    [Add]│
└─────────────────────────────────────────┘

┌────────────┬────────────┬────────────┐
│   Total    │  Required  │  Optional  │
│     15     │      7     │      8     │
└────────────┴────────────┴────────────┘

┌────────────────────────────────────────┐
│         Available Courses               │
├────────────────────────────────────────┤
│ Title │ Category │ Validity │ Status   │
├────────────────────────────────────────┤
│ Safety Training    │ Safety  │ 12 mo  │
│ [Edit] [Delete]                        │
├────────────────────────────────────────┤
│ More rows...                            │
├────────────────────────────────────────┤
│ [Prev] Page 1 of 5 (15 total) [Next]   │
└────────────────────────────────────────┘

(Modal overlays entire page when opened)
┌────────────────────────────────────────┐
│         Add New Course                  │
│                                         │
│ Title: [_________________]              │
│ Category: [_________________]           │
│ Validity: [_______]                     │
│ Description: [_______________]          │
│ ☐ Required Course                       │
│ ☑ Active                                │
│                      [Cancel] [Create]  │
└────────────────────────────────────────┘
```

---

## Error Handling

### API Errors
```typescript
try {
  await coursesApi.create(payload);
} catch (err: any) {
  // Error from server response
  const message = err.response?.data?.message || err.message;
  setFormError(message);
  
  // Examples:
  // - "Title already exists"
  // - "Invalid validity period"
  // - "Database connection failed"
}
```

### Display Errors
```tsx
{formError && (
  <div style={{
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fee2e2',      // Light red
    color: '#991b1b',                 // Dark red
    borderRadius: '4px',
    border: '1px solid #fecaca',     // Medium red
  }}>
    {formError}
  </div>
)}
```

### Confirmation Dialogs
```typescript
if (!confirm(`Are you sure you want to delete course "${course.title}"?`)) {
  return;  // User cancelled
}
// Proceed with deletion
```

### Page-Level Errors
```typescript
if (error) {
  return (
    <Layout>
      <h1>Course Catalog</h1>
      <Card>
        <p style={{ color: 'red' }}>Error loading courses: {error}</p>
      </Card>
    </Layout>
  );
}
```

---

## Performance Considerations

### Memoization
```typescript
// Memoize data transformation to prevent unnecessary recalculations
const data: CourseRow[] = useMemo(() => {
  if (!coursesData?.items) return [];
  return coursesData.items;
}, [coursesData]);

// Memoize column definitions to prevent table re-renders
const columns = useMemo(
  () => [
    { id: 'title', header: 'Course Title', accessor: ... },
    // More columns...
  ],
  [data]
);
```

### Pagination Benefits
- Only 10 courses per page (not all 100+)
- Smaller data sets reduce table render time
- Faster page transitions
- Lower memory usage

### Lazy Form Validation
- Only shows errors on submission (not on every keystroke)
- HTML5 built-in validation handles required fields
- Reduces re-renders during form input

### API Caching
- `useCourses` hook manages caching
- Refetch only when needed (after CRUD operations)
- Avoids unnecessary API calls

---

## Testing Examples

### Unit Tests - Add Course
```typescript
describe('CourseCatalog - Add Course', () => {
  it('should open modal when Add Course button clicked', () => {
    render(<CourseCatalog />);
    fireEvent.click(screen.getByText('+ Add Course'));
    expect(screen.getByText('Add New Course')).toBeInTheDocument();
  });

  it('should populate form with empty values', () => {
    render(<CourseCatalog />);
    fireEvent.click(screen.getByText('+ Add Course'));
    const titleInput = screen.getByDisplayValue('');
    expect(titleInput).toHaveValue('');
  });
});
```

### Integration Tests - Submit Course
```typescript
describe('CourseCatalog - Submit Course', () => {
  it('should call coursesApi.create with correct payload', async () => {
    const mockCreate = jest.fn();
    jest.mock('../services/apiClient', () => ({
      coursesApi: { create: mockCreate }
    }));

    render(<CourseCatalog />);
    fireEvent.click(screen.getByText('+ Add Course'));
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Safety Training' }
    });
    fireEvent.change(screen.getByLabelText('Validity'), {
      target: { value: '12' }
    });
    
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'Safety Training',
        category: null,
        validityMonths: 12,
        description: null,
        isRequired: false,
        isActive: true,
      });
    });
  });
});
```

### Integration Tests - Delete Course
```typescript
describe('CourseCatalog - Delete Course', () => {
  it('should show confirmation and delete course', async () => {
    global.confirm = jest.fn(() => true);
    const mockDelete = jest.fn();

    render(<CourseCatalog />);
    
    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('Safety Training')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('course-123');
  });
});
```

---

## Accessibility

### Keyboard Navigation
- Tab to buttons and form fields
- Enter/Space to activate buttons
- Escape to close modal (future enhancement)

### Screen Reader Support
```tsx
<Button
  aria-label={`Edit ${r.title}`}
  onClick={() => handleEditCourse(r.id)}
>
  Edit
</Button>

// Announces: "Edit Safety Training" instead of just "Edit"
```

### Form Labels
```tsx
<label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
  Title <span style={{ color: '#ef4444' }}>*</span>
</label>
<input type="text" required ... />
```

### Color Contrast
- Status badges use distinct colors (green, red, yellow, blue)
- Error messages use red background (#fee2e2) with dark text (#991b1b)
- Text meets WCAG AA standards

### Semantic HTML
```tsx
<form onSubmit={handleSubmit}>
  <input type="text" required />
  <input type="email" />
  <input type="number" />
  <button type="submit">Create</button>
</form>
```

---

## Related Documentation

- **[useCourses Hook](../hooks/useCourses_doc.md)** - Data fetching and state management
- **[Button Component](../components/Button_doc.md)** - Button styling and variants
- **[Table Component](../components/Table_doc.md)** - Table rendering and columns
- **[StatusBadge Component](../components/StatusBadge_doc.md)** - Status indicator styling
- **[Card Component](../components/Card_doc.md)** - Card layout component
- **[Layout Component](../components/Layout_doc.md)** - Page layout wrapper
- **[apiClient Service](../services/apiClient_doc.md)** - API integration

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-24 | Initial documentation |

## Author

Frontend Team | Last Updated: January 24, 2026
