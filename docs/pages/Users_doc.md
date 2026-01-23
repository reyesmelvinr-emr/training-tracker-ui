# Users Page Documentation

## Overview

**File:** `src/pages/Users.tsx`  
**Type:** React Page Component  
**Route:** `/users` (Admin Interface)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Administrative user management interface providing comprehensive CRUD operations for system users. Enables administrators to create, edit, deactivate, and delete user accounts with paginated list display and real-time status updates.

### Key Features
- Paginated user list with 10-item page size
- Complete CRUD operations (Create, Update, Delete)
- Modal-based form interface for user management
- User status display (Active/Inactive) with color-coded badges
- Email and full name management
- Account creation timestamp tracking
- Bulk status indicators
- Real-time list refresh after operations
- Comprehensive error handling
- Form validation and error messaging

---

## Component Signature

```typescript
function Users(): JSX.Element
```

### No Props
Page-level component rendered by React Router.

---

## State Management

### External State (Hooks)
```typescript
const { data: usersData, loading, error, refetch } = useUsers(page, pageSize);
```

### Local State
```typescript
const [page, setPage] = useState(1);
const pageSize = 10;  // Fixed pagination size

// Modal control
const [showModal, setShowModal] = useState(false);

// Form state
const [editingUserId, setEditingUserId] = useState<string | null>(null);
const [formData, setFormData] = useState<UserFormData>({
  email: '',
  fullName: '',
  isActive: true,
});
const [formError, setFormError] = useState<string | null>(null);
const [formLoading, setFormLoading] = useState(false);
```

### Computed State
```typescript
const data: UserRow[] = useMemo(() => {
  if (!usersData?.items) return [];
  return usersData.items;
}, [usersData]);
```

---

## Data Structures

### UserRow (Display Format)
```typescript
interface UserRow {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}
```

### UserFormData (Form Submission)
```typescript
interface UserFormData {
  email: string;
  fullName: string;
  isActive: boolean;
}
```

### API Response (from useUsers)
```typescript
{
  items: UserRow[],
  totalCount: number,
  totalPages: number
}
```

---

## CRUD Operations

### CREATE - Add New User
```typescript
const handleAddUser = () => {
  setEditingUserId(null);
  setFormData({ email: '', fullName: '', isActive: true });
  setFormError(null);
  setShowModal(true);
};
```

**Trigger:** "Add User" button in header  
**Modal:** User Form Modal appears with blank fields

### READ - Paginated User List
```typescript
// Hook fetch (auto-triggered on page change)
const { data: usersData, loading, error, refetch } = useUsers(page, pageSize);

// Rendered in table
<Table
  caption="System Users"
  columns={columns}
  data={data}
/>
```

**Display:** Table with 10 users per page  
**Pagination:** Previous/Next buttons with page counter  
**Columns:** Email, Full Name, Status, Created Date, Actions

### UPDATE - Edit Existing User
```typescript
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
```

**Trigger:** Edit button in actions column  
**Modal:** Form pre-populated with current user data  
**Use Cases:** Update email, change name, toggle active status

### DELETE - Remove User
```typescript
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
```

**Trigger:** Delete button in actions column  
**Confirmation:** Browser confirm dialog  
**Effect:** User removed from list after successful deletion

### SUBMIT - Save User (Create/Update)
```typescript
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
```

**Validation:** Email and Full Name required (HTML5)  
**Distinction:** Routes to create() or update() based on editingUserId  
**Success:** Modal closes, list refreshes automatically

---

## Modal Form Pattern

### Form Structure
```tsx
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
      {/* Form content */}
    </div>
  </div>
)}
```

**Modal Size:** 500px max width (smaller than course catalog)  
**Positioning:** Centered on screen with 50% opacity backdrop  
**Interaction:** Click outside does NOT close (intentional)

### Form Fields
| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| **Email** | email | ✓ | '' | Must be valid email format |
| **Full Name** | text | ✓ | '' | User's display name |
| **Active** | checkbox | ✗ | true | Account enabled/disabled |

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
], [data]);
```

### Column Features
| Column | Type | Purpose | Format |
|--------|------|---------|--------|
| Email | Text | User contact | user@example.com |
| Full Name | Text | User identifier | John Doe |
| Status | Badge | Account state | Active (green) / Inactive (red) |
| Created | Date | Account creation | MM/DD/YYYY |
| Actions | Buttons | Edit/Delete operations | Primary + Secondary |

---

## User Status Management

### Status Badge Colors
```typescript
<StatusBadge tone={r.isActive ? 'success' : 'danger'}>
  {r.isActive ? 'Active' : 'Inactive'}
</StatusBadge>
```

| Status | Tone | Color | Meaning |
|--------|------|-------|---------|
| **Active** | success | Green | Account enabled, can login |
| **Inactive** | danger | Red | Account disabled, cannot login |

### Toggle Active Status
```typescript
// In modal form
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

// Checking box sets isActive = true
// Unchecking box sets isActive = false
```

---

## Pagination Controls

### Implementation
```tsx
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
```

**Display Logic:** Only shown if totalPages > 1  
**Previous Button:** Disabled on page 1  
**Next Button:** Disabled on last page  
**Info Text:** Shows current page, total pages, total user count

---

## Usage Examples

### 1. Create New User via Modal
```typescript
// User clicks "Add User" button
const handleAddUser = () => {
  setEditingUserId(null);
  setFormData({ email: '', fullName: '', isActive: true });
  setFormError(null);
  setShowModal(true);
};

// Modal opens with empty form
// User types: email = "john.doe@company.com", fullName = "John Doe"
// User submits form

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);

  try {
    // Create new user
    await usersApi.create({
      email: 'john.doe@company.com',
      fullName: 'John Doe',
      isActive: true,
    });
    await refetch();  // Refresh list
    handleCloseModal();  // Close modal
  } catch (err: any) {
    setFormError(err.response?.data?.message);  // "Email already exists"
  } finally {
    setFormLoading(false);
  }
};
```

### 2. Edit User - Change Email
```typescript
// Table shows user: "john.doe@company.com", "John Doe", Active
// User clicks Edit button

const handleEditUser = (userId: string) => {
  const user = data.find(u => u.id === userId);
  setEditingUserId('user-123');
  setFormData({
    email: 'john.doe@company.com',
    fullName: 'John Doe',
    isActive: true,
  });
  setShowModal(true);
};

// Modal shows pre-filled form
// User changes: email to "john.smith@company.com"
// User clicks "Update"

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await usersApi.update('user-123', {
      email: 'john.smith@company.com',
      fullName: 'John Doe',
      isActive: true,
    });
    await refetch();  // Table refreshes with new email
    handleCloseModal();
  } catch (err) {
    setFormError(err.message);  // "Email already exists"
  }
};
```

### 3. Deactivate User (Toggle Status)
```typescript
// User wants to disable an account
// User clicks Edit on "jane.smith@company.com"

const handleEditUser = (userId: string) => {
  const user = data.find(u => u.id === userId);
  setFormData({
    email: user.email,
    fullName: user.fullName,
    isActive: true,  // Currently active
  });
  setShowModal(true);
};

// Modal shows form with "Active" checkbox CHECKED
// User unchecks the "Active" checkbox
// isActive becomes false

const handleSubmit = async (e: React.FormEvent) => {
  try {
    await usersApi.update('user-456', {
      email: 'jane.smith@company.com',
      fullName: 'Jane Smith',
      isActive: false,  // DEACTIVATED
    });
    await refetch();
    handleCloseModal();
  } catch (err) {
    setFormError(err.message);
  }
};

// Table now shows:
// jane.smith@company.com | Jane Smith | [Inactive - red badge]
```

### 4. Delete User with Confirmation
```typescript
const handleDeleteUser = async (userId: string) => {
  const user = data.find(u => u.id === userId);
  
  // Show confirmation dialog
  if (!confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
    return;  // User cancelled
  }

  try {
    await usersApi.delete(userId);
    await refetch();  // User removed from table
  } catch (err: any) {
    alert(`Failed to delete user: ${err.message}`);
  }
};

// If user confirms:
// - API call: DELETE /api/users/user-123
// - List refreshes
// - User no longer appears in table
```

### 5. Navigate User List Pagination
```typescript
// Initial render - page 1
const [page, setPage] = useState(1);
const { data: usersData, loading, error, refetch } = useUsers(1, 10);
// Displays users 1-10

// User clicks "Next" button
const handleNextPage = () => {
  setPage(p => Math.min(usersData.totalPages, p + 1));
  // Triggers useUsers with page: 2
  // Table shows users 11-20
};

// Pagination shows:
// [Previous] Page 2 of 5 (47 total users) [Next]
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

### 6. Handle Email Validation Error
```typescript
// User tries to create account with invalid email
// Form has: email = "notanemail", fullName = "Test User"

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError(null);
  setFormLoading(true);

  try {
    await usersApi.create({
      email: 'notanemail',  // Invalid format
      fullName: 'Test User',
      isActive: true,
    });
  } catch (err: any) {
    // API returns 400 error
    setFormError('Invalid email format');  // Displayed in red box
    setFormLoading(false);
  }
};
```

### 7. Display Duplicate Email Error
```typescript
// User tries to create account with existing email
// Email "john@company.com" already exists

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await usersApi.create({
      email: 'john@company.com',  // Already exists
      fullName: 'Another John',
      isActive: true,
    });
  } catch (err: any) {
    // API returns 409 conflict
    setFormError(err.response?.data?.message);  // "Email already exists"
  }
};

// User sees error and must change email
```

### 8. Disable Form During Submission
```typescript
// User clicks "Create" button
setFormLoading(true);

// All form inputs are disabled
<input type="email" disabled={formLoading} />
<input type="text" disabled={formLoading} />

// Button text changes and disables
<Button type="submit" disabled={formLoading}>
  {formLoading ? 'Saving...' : 'Create'}  // Shows "Saving..."
</Button>

// Prevents duplicate form submissions
// After API response completes:
setFormLoading(false);
```

### 9. Reset Form on Modal Close
```typescript
const handleCloseModal = () => {
  setShowModal(false);
  setEditingUserId(null);
  setFormData({
    email: '',
    fullName: '',
    isActive: true,
  });
  setFormError(null);
};

// Next time modal opens:
// - Form is completely empty (except isActive = true)
// - No error message displayed
// - Ready for new user creation
```

### 10. Format Date in Table
```typescript
const columns = useMemo(() => [
  {
    id: 'created',
    header: 'Created',
    accessor: (r: UserRow) => new Date(r.createdUtc).toLocaleDateString()
  },
  // More columns...
], [data]);

// API returns: createdUtc = "2026-01-15T10:30:00Z"
// Table displays: "1/15/2026"
// Browser locale determines format (US: MM/DD/YYYY, EU: DD/MM/YYYY)
```

### 11. Aria Labels for Screen Readers
```tsx
<Button
  variant="primary"
  onClick={() => handleEditUser(r.id)}
  aria-label={`Edit ${r.fullName}`}
>
  Edit
</Button>

// Screen reader announces: "Edit John Doe"
// Instead of just: "Edit" (which would be confusing with multiple buttons)

<Button
  variant="secondary"
  onClick={() => handleDeleteUser(r.id)}
  aria-label={`Delete ${r.fullName}`}
>
  Delete
</Button>

// Screen reader announces: "Delete John Doe"
```

### 12. Empty State Message
```typescript
return (
  <Layout>
    <Card title="All Users">
      {loading ? (
        <p>Loading users...</p>
      ) : data.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No users found. Add your first user to get started.
        </p>
      ) : (
        <Table columns={columns} data={data} />
      )}
    </Card>
  </Layout>
);

// If no users exist:
// - Loading message during fetch
// - Centered message: "No users found..."
// - No pagination controls shown
```

---

## Integration Points

### API Service
```typescript
import { usersApi } from '../services/apiClient';

// Available methods:
// - usersApi.create(payload) → Promise<User>
// - usersApi.update(userId, payload) → Promise<User>
// - usersApi.delete(userId) → Promise<void>
// - useUsers hook handles GET requests with pagination
```

### Component Dependencies
```typescript
import { Layout } from '../components/common/Layout';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useUsers } from '../hooks/useUsers';
```

### Data Flow
```
useUsers(page, pageSize) → usersData
    ↓
Table displays UserRow[] with columns
    ↓
Modal form submits to usersApi
    ↓
refetch() updates useUsers
    ↓
Table re-renders with updated data
```

---

## UI Layout Structure

```
┌─────────────────────────────────────────┐
│              Users Page            [+Add]│
└─────────────────────────────────────────┘

┌────────────────────────────────────────┐
│             All Users                  │
├────────────────────────────────────────┤
│ Email          │ Full Name │ Status   │
├────────────────────────────────────────┤
│ john@co.com    │ John Doe  │ Active   │
│ [Edit] [Delete]                        │
├────────────────────────────────────────┤
│ jane@co.com    │ Jane Smith│ Inactive │
│ [Edit] [Delete]                        │
├────────────────────────────────────────┤
│ [Prev] Page 1 of 5 (47 total) [Next]   │
└────────────────────────────────────────┘

(Modal overlays when opened)
┌────────────────────────────────────────┐
│         Add New User                    │
│                                         │
│ Email: [user@company.com]               │
│ Full Name: [John Doe]                   │
│ ☑ Active                                │
│                      [Cancel] [Create]  │
└────────────────────────────────────────┘
```

---

## Error Handling

### Validation Errors
```typescript
// HTML5 validation for required fields
<input
  type="email"
  required
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>

// Browser shows: "Please fill out this field" if empty
// Browser validates email format automatically
```

### API Errors
```typescript
try {
  await usersApi.create(formData);
} catch (err: any) {
  const message = err.response?.data?.message || err.message;
  setFormError(message);
  
  // Possible errors:
  // - "Email already exists"
  // - "Invalid email format"
  // - "Database connection failed"
  // - "User creation failed"
}
```

### Deletion Confirmation
```typescript
if (!confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
  return;  // User clicked "Cancel"
}
// Proceed with deletion if user clicked "OK"
```

### Page-Level Errors
```typescript
if (error) {
  return (
    <Layout>
      <h1>Users</h1>
      <Card>
        <p style={{ color: 'red' }}>Error loading users: {error}</p>
      </Card>
    </Layout>
  );
}
```

---

## Performance Considerations

### Memoization
```typescript
// Prevent unnecessary data transformations
const data: UserRow[] = useMemo(() => {
  if (!usersData?.items) return [];
  return usersData.items;
}, [usersData]);

// Prevent table re-renders on irrelevant state changes
const columns = useMemo(() => [
  { id: 'email', header: 'Email', accessor: ... },
  // More columns...
], [data]);
```

### Pagination Benefits
- Only 10 users per page (not all 100+)
- Smaller datasets reduce render time
- Faster page navigation
- Lower memory usage

### Lazy Error Display
- Only shows form errors on submission
- No validation during typing
- HTML5 handles required field checking
- Reduces re-render overhead

---

## Testing Examples

### Unit Test - Open Modal
```typescript
describe('Users - Modal', () => {
  it('should open modal when Add User clicked', () => {
    render(<Users />);
    fireEvent.click(screen.getByText('+ Add User'));
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  it('should show create button label', () => {
    render(<Users />);
    fireEvent.click(screen.getByText('+ Add User'));
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});
```

### Integration Test - Create User
```typescript
describe('Users - Create', () => {
  it('should create new user with valid data', async () => {
    const mockCreate = jest.fn();
    jest.mock('../services/apiClient', () => ({
      usersApi: { create: mockCreate }
    }));

    render(<Users />);
    fireEvent.click(screen.getByText('+ Add User'));
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'New User' }
    });
    
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        email: 'new@example.com',
        fullName: 'New User',
        isActive: true,
      });
    });
  });
});
```

### Integration Test - Edit User
```typescript
describe('Users - Edit', () => {
  it('should populate form with existing user data', async () => {
    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);

    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Edit User')).toBeInTheDocument();
  });
});
```

### Integration Test - Delete User
```typescript
describe('Users - Delete', () => {
  it('should confirm before deleting', async () => {
    global.confirm = jest.fn(() => true);
    const mockDelete = jest.fn();

    render(<Users />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete user "John Doe"?'
    );
    expect(mockDelete).toHaveBeenCalled();
  });
});
```

---

## Accessibility

### Keyboard Navigation
- Tab through all form fields and buttons
- Enter/Space to submit or activate buttons
- Escape key support (future enhancement)

### Screen Reader Support
```tsx
<input
  type="email"
  aria-label="Email address"
  value={formData.email}
/>

<Button aria-label={`Edit ${r.fullName}`}>
  Edit
</Button>

// Screen readers announce full context instead of generic labels
```

### Color Contrast
- Active status: Green (good contrast)
- Inactive status: Red (good contrast)
- Error messages: Red text on light red background
- Text meets WCAG AA standards

### Semantic HTML
```tsx
<form onSubmit={handleSubmit}>
  <label>Email</label>
  <input type="email" required />
  
  <label>Full Name</label>
  <input type="text" required />
  
  <button type="submit">Create</button>
</form>
```

---

## Related Documentation

- **[useUsers Hook](../hooks/useUsers_doc.md)** - Data fetching and pagination
- **[Button Component](../components/Button_doc.md)** - Button styling and variants
- **[Table Component](../components/Table_doc.md)** - Table rendering
- **[StatusBadge Component](../components/StatusBadge_doc.md)** - Status indicators
- **[Card Component](../components/Card_doc.md)** - Card layout
- **[Layout Component](../components/Layout_doc.md)** - Page wrapper
- **[apiClient Service](../services/apiClient_doc.md)** - API integration

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-24 | Initial documentation |

## Author

Frontend Team | Last Updated: January 24, 2026
