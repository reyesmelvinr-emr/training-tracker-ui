# AdminPanel Page Documentation

## Overview

**File:** `src/pages/AdminPanel.tsx`  
**Type:** React Page Component  
**Route:** `/admin` (Admin Interface)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Comprehensive system administration dashboard providing real-time monitoring, statistics tracking, and bulk user management. Displays system health status, enrollment analytics, and enables administrators to manage multiple user accounts efficiently through bulk operations.

### Key Features
- System health monitoring (API, Database, Uptime, Active Sessions)
- Statistics dashboard (Users, Courses, Enrollments, Completion Rate)
- Bulk user operations (Activate/Deactivate multiple users)
- User selection with checkboxes
- All users table with bulk selection controls
- Real-time health status indicators
- Comprehensive statistics cards with breakdowns
- Refresh functionality for all data
- Mock uptime tracking for POC
- Real-time user status displays

---

## Component Signature

```typescript
function AdminPanel(): JSX.Element
```

### No Props
Page-level component rendered by React Router.

---

## State Management

### External State (Hooks)
```typescript
const { statistics, loading: statsLoading, refetch: refetchStats } = useStatistics();
const { health, loading: healthLoading, refetch: refetchHealth } = useHealth();
const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useUsers(1, 100);
```

### Local State
```typescript
const users = usersData?.items || [];

// Bulk selection
const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

// Bulk operations
const [bulkActionLoading, setBulkActionLoading] = useState(false);
const [bulkActionMessage, setBulkActionMessage] = useState<string | null>(null);

// Mock uptime (POC)
const [uptime, setUptime] = useState('24h 15m');
```

### Computed State
None - all state is derived from hooks or managed locally.

---

## Data Structures

### Health Status Data
```typescript
interface HealthStatus {
  apiStatus: 'Healthy' | 'Unhealthy' | 'Unknown';
  databaseStatus: 'Healthy' | 'Unhealthy' | 'Unknown';
  databaseError?: string;
}
```

### Statistics Data
```typescript
interface Statistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  
  totalCourses: number;
  requiredCourses: number;
  optionalCourses: number;
  
  totalEnrollments: number;
  pendingEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  
  completionRate: number;  // Percentage
}
```

### User Summary (for bulk operations)
```typescript
interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdUtc: string;
}
```

### Bulk Update Payload
```typescript
interface BulkUpdateRequest {
  userIds: string[];
  isActive: boolean;
}
```

### Bulk Update Response
```typescript
interface BulkUpdateResult {
  successCount: number;
  failedCount: number;
  errors: Array<{ userId: string; error: string }>;
}
```

---

## System Health Section

### Health Cards
```tsx
<Card>
  <div className="text-center">
    <div className="text-3xl mb-2">🌐</div>
    <h3 className="text-sm font-medium text-gray-500">API Status</h3>
    {healthLoading ? (
      <p className="text-lg font-semibold text-gray-400 mt-2">Loading...</p>
    ) : (
      <div className="mt-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(health?.apiStatus || 'Unknown')}`}>
          {health?.apiStatus || 'Unknown'}
        </span>
      </div>
    )}
  </div>
</Card>
```

### Status Badge Styling
```typescript
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    Healthy: 'bg-green-100 text-green-800',
    Unhealthy: 'bg-red-100 text-red-800',
    Unknown: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || colors.Unknown;
};
```

| Status | Color | Background | Text |
|--------|-------|-----------|------|
| **Healthy** | Green | bg-green-100 | text-green-800 |
| **Unhealthy** | Red | bg-red-100 | text-red-800 |
| **Unknown** | Gray | bg-gray-100 | text-gray-800 |

### Health Card Types
| Card | Icon | Data | Purpose |
|------|------|------|---------|
| API Status | 🌐 | health.apiStatus | REST API availability |
| Database Status | 💾 | health.databaseStatus | Database connectivity |
| Uptime | ⏱️ | uptime state | System running time |
| Active Sessions | 👥 | statistics.activeUsers | Current active users |

---

## Statistics Dashboard

### Statistics Cards
```tsx
<Card>
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-gray-500">Users</h3>
      <span className="text-2xl">👤</span>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-3">{statistics?.totalUsers || 0}</p>
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Active:</span>
        <span className="font-medium text-green-600">{statistics?.activeUsers || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Inactive:</span>
        <span className="font-medium text-gray-500">{statistics?.inactiveUsers || 0}</span>
      </div>
    </div>
  </div>
</Card>
```

### Statistics Breakdown

#### Users Card
```
Users
┌─────────────────┐
│      Total      │
│       47        │
├─────────────────┤
│ Active: 45 🟢   │
│ Inactive: 2 ⚫  │
└─────────────────┘
```

#### Courses Card
```
Courses
┌─────────────────┐
│      Total      │
│       18        │
├─────────────────┤
│ Required: 6 🔴  │
│ Optional: 12 🔵 │
└─────────────────┘
```

#### Enrollments Card
```
Enrollments
┌──────────────────┐
│      Total       │
│       152        │
├──────────────────┤
│ Pending: 15 🟡   │
│ Active: 67 🔵    │
│ Completed: 65 🟢 │
│ Cancelled: 5 🔴  │
└──────────────────┘
```

#### Completion Rate Card
```
Completion Rate
┌──────────────────┐
│      78.5%       │
├──────────────────┤
│ 120 of 153       │
│ enrollments      │
│ completed        │
└──────────────────┘
```

---

## Bulk User Operations

### Selection State Management
```typescript
// Single user toggle
const handleSelectUser = (userId: string, checked: boolean) => {
  const newSelected = new Set(selectedUserIds);
  if (checked) {
    newSelected.add(userId);
  } else {
    newSelected.delete(userId);
  }
  setSelectedUserIds(newSelected);
};

// Select all toggle
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedUserIds(new Set(users.map(u => u.id)));
  } else {
    setSelectedUserIds(new Set());
  }
};
```

### Bulk Action Execution
```typescript
const handleBulkAction = async (action: 'activate' | 'deactivate') => {
  if (selectedUserIds.size === 0) {
    setBulkActionMessage('Please select at least one user');
    return;
  }

  const confirmMessage = action === 'activate'
    ? `Are you sure you want to activate ${selectedUserIds.size} user(s)?`
    : `Are you sure you want to deactivate ${selectedUserIds.size} user(s)?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  setBulkActionLoading(true);
  setBulkActionMessage(null);

  try {
    const result = await adminService.bulkUpdateUserStatus({
      userIds: Array.from(selectedUserIds),
      isActive: action === 'activate',
    });

    setBulkActionMessage(
      `Success: ${result.successCount} user(s) updated. Failed: ${result.failedCount}.`
    );

    if (result.errors.length > 0) {
      console.error('Bulk update errors:', result.errors);
    }

    // Refresh data
    await refetchUsers();
    await refetchStats();
    setSelectedUserIds(new Set());
  } catch (error) {
    setBulkActionMessage(
      `Error: ${error instanceof Error ? error.message : 'Failed to update users'}`
    );
    console.error('Bulk action error:', error);
  } finally {
    setBulkActionLoading(false);
  }
};
```

### Selection Feedback
```tsx
<div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
  <div className="flex items-center gap-4">
    <span className="text-sm text-gray-600">
      {selectedUserIds.size} user(s) selected
    </span>
    {selectedUserIds.size > 0 && (
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => handleBulkAction('activate')}
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? 'Processing...' : '✅ Activate Selected'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleBulkAction('deactivate')}
          disabled={bulkActionLoading}
        >
          {bulkActionLoading ? 'Processing...' : '❌ Deactivate Selected'}
        </Button>
      </div>
    )}
  </div>
</div>
```

---

## Users Table Structure

### Table Columns
| Column | Type | Content | Width |
|--------|------|---------|-------|
| **Checkbox** | Checkbox | Selection control | Minimal |
| **User** | Stacked Text | Full Name + Email | 40% |
| **Status** | Badge | Active/Inactive | 20% |
| **Created** | Date | Account creation date | 20% |

### Table Implementation
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-3 text-left">
        <input
          type="checkbox"
          checked={selectedUserIds.size === users.length && users.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 text-blue-600"
        />
      </th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {users.map((user: UserSummary) => (
      <tr key={user.id} className={`hover:bg-gray-50 ${selectedUserIds.has(user.id) ? 'bg-blue-50' : ''}`}>
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedUserIds.has(user.id)}
            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
        </td>
        <td className="px-4 py-3">
          <div>
            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(user.createdUtc).toLocaleDateString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Row Highlighting
- **Default:** White background
- **Hover:** Light gray background (hover:bg-gray-50)
- **Selected:** Light blue background (bg-blue-50)

---

## Uptime Tracking (POC)

### Mock Implementation
```typescript
const [uptime, setUptime] = useState('24h 15m');

useEffect(() => {
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60)) + 24;
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60)) + 15;
    setUptime(`${hours}h ${minutes}m`);
  }, 60000); // Update every minute

  return () => clearInterval(interval);
}, []);
```

**Note:** This is POC mock implementation. Production should track actual server uptime.

---

## Usage Examples

### 1. View System Health Status
```typescript
// Page loads and fetches health data
const { health, loading: healthLoading } = useHealth();

// Initially: loading = true, health = undefined
// Display: "Loading..." text in each status card

// After fetch completes:
// health = {
//   apiStatus: 'Healthy',
//   databaseStatus: 'Healthy',
//   databaseError: null
// }

// Display updates:
// API Status card shows green "Healthy" badge
// Database Status card shows green "Healthy" badge
```

### 2. View Statistics Dashboard
```typescript
const { statistics, loading: statsLoading } = useStatistics();

// Statistics object contains:
// {
//   totalUsers: 47,
//   activeUsers: 45,
//   inactiveUsers: 2,
//   totalCourses: 18,
//   requiredCourses: 6,
//   optionalCourses: 12,
//   totalEnrollments: 152,
//   pendingEnrollments: 15,
//   activeEnrollments: 67,
//   completedEnrollments: 65,
//   cancelledEnrollments: 5,
//   completionRate: 42.76
// }

// Cards display:
// Users: 47 (Active: 45, Inactive: 2)
// Courses: 18 (Required: 6, Optional: 12)
// Enrollments: 152 (Pending: 15, Active: 67, Completed: 65, Cancelled: 5)
// Completion Rate: 42.8% (65 of 152 enrollments)
```

### 3. Select Single User for Bulk Operation
```typescript
// Page loads with all users from API
const users = [
  { id: 'user-1', fullName: 'John Doe', email: 'john@co.com', isActive: true, ... },
  { id: 'user-2', fullName: 'Jane Smith', email: 'jane@co.com', isActive: true, ... },
  { id: 'user-3', fullName: 'Bob Wilson', email: 'bob@co.com', isActive: false, ... },
];

// User clicks checkbox next to John Doe
const handleSelectUser = (userId: string, checked: boolean) => {
  const newSelected = new Set(selectedUserIds);
  newSelected.add('user-1');
  setSelectedUserIds(newSelected);  // { 'user-1' }
};

// UI updates:
// "1 user(s) selected" appears
// [Activate Selected] and [Deactivate Selected] buttons appear
```

### 4. Select All Users
```typescript
// Page shows 47 users total in table
const users = [/* ... 47 users ... */];

// User clicks "Select All" checkbox in table header
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedUserIds(new Set(users.map(u => u.id)));
  }
  // selectedUserIds = Set of all 47 user IDs
};

// UI updates:
// "47 user(s) selected" appears
// All checkboxes checked
// All rows highlighted in blue
// [Activate Selected] and [Deactivate Selected] enabled
```

### 5. Bulk Activate Users
```typescript
// User has selected 5 inactive users
// selectedUserIds = { 'user-10', 'user-15', 'user-20', 'user-25', 'user-30' }

// User clicks "Activate Selected" button
const handleBulkAction = async (action: 'activate') => {
  if (!confirm('Are you sure you want to activate 5 user(s)?')) {
    return;
  }

  setBulkActionLoading(true);
  
  try {
    const result = await adminService.bulkUpdateUserStatus({
      userIds: ['user-10', 'user-15', 'user-20', 'user-25', 'user-30'],
      isActive: true
    });

    // result = { successCount: 5, failedCount: 0, errors: [] }
    setBulkActionMessage('Success: 5 user(s) updated. Failed: 0.');
    
    await refetchUsers();  // Refresh user table
    await refetchStats();  // Update statistics
    setSelectedUserIds(new Set());  // Clear selection
  } catch (error) {
    setBulkActionMessage(`Error: ${error.message}`);
  } finally {
    setBulkActionLoading(false);
  }
};

// UI updates:
// Button shows "Processing..." during operation
// After success: green success message displayed
// Table refreshes with activated users now showing isActive = true
// Statistics update: activeUsers increased by 5
// Selection cleared
```

### 6. Bulk Deactivate with Partial Failure
```typescript
// User attempts to deactivate 10 users
// 3 users have active enrollments and cannot be deactivated

const result = {
  successCount: 7,
  failedCount: 3,
  errors: [
    { userId: 'user-50', error: 'User has active enrollments' },
    { userId: 'user-51', error: 'User has active enrollments' },
    { userId: 'user-52', error: 'User has active enrollments' }
  ]
};

setBulkActionMessage('Success: 7 user(s) updated. Failed: 3.');
console.error('Bulk update errors:', result.errors);

// User sees yellow/orange message indicating partial success
// Errors logged to console
// 7 users successfully deactivated
// 3 users remain active
```

### 7. Bulk Action Confirmation Dialog
```typescript
// User has selected 8 users for deactivation
// User clicks "Deactivate Selected" button

const handleBulkAction = async (action: 'deactivate') => {
  const confirmMessage = 
    `Are you sure you want to deactivate ${selectedUserIds.size} user(s)?`;
  // "Are you sure you want to deactivate 8 user(s)?"

  if (!confirm(confirmMessage)) {
    return;  // User clicked Cancel - operation aborted
  }

  // User clicked OK - proceed with deactivation
  setBulkActionLoading(true);
  try {
    const result = await adminService.bulkUpdateUserStatus({
      userIds: Array.from(selectedUserIds),
      isActive: false,
    });
    // ... handle result ...
  }
};
```

### 8. Refresh All Data
```typescript
// Header has "🔄 Refresh All" button
<Button
  variant="secondary"
  onClick={() => {
    refetchHealth();
    refetchStats();
  }}
>
  🔄 Refresh All
</Button>

// User clicks refresh button
// All three data sources refresh:
// - useHealth() re-fetches health status
// - useStatistics() re-fetches statistics
// - Table already shows current data

// Health cards update with latest status
// Statistics cards update with latest numbers
```

### 9. Empty Bulk Action Message
```typescript
// User clicks "Activate Selected" without selecting any users
const handleBulkAction = async (action: 'activate') => {
  if (selectedUserIds.size === 0) {
    setBulkActionMessage('Please select at least one user');
    return;
  }
  // API call skipped
};

// UI shows yellow message: "Please select at least one user"
// No API call made
```

### 10. View User Details in Table
```typescript
// Table displays each user as stacked content:
// ┌─────────────────────────────────┐
// │ John Doe              (bold)     │  ← fullName
// │ john@example.com      (gray)     │  ← email
// │ Active (green badge)             │  ← isActive status
// │ 1/15/2026                        │  ← created date
// └─────────────────────────────────┘

// Stacked format saves horizontal space
// Makes user identification quick and easy
```

### 11. Status Badge Color Coding
```typescript
// Table shows status badges for each user
<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
  user.isActive
    ? 'bg-green-100 text-green-800'    // Green for active
    : 'bg-gray-100 text-gray-800'       // Gray for inactive
}`}>
  {user.isActive ? 'Active' : 'Inactive'}
</span>

// Visual quick scan:
// Green badges = active users
// Gray badges = inactive users
```

### 12. Handle Network Error
```typescript
// User clicks "Activate Selected" but network request fails
try {
  const result = await adminService.bulkUpdateUserStatus({
    userIds: Array.from(selectedUserIds),
    isActive: true,
  });
} catch (error) {
  setBulkActionMessage(
    `Error: ${error instanceof Error ? error.message : 'Failed to update users'}`
  );
  console.error('Bulk action error:', error);
} finally {
  setBulkActionLoading(false);
}

// Error message displayed: "Error: Network request failed"
// Button returns to normal state (not loading)
// Selection remains so user can retry
```

---

## Integration Points

### Admin Service
```typescript
import { adminService } from '../services/adminService';

// Available methods:
// - adminService.bulkUpdateUserStatus(request) → Promise<BulkUpdateResult>
```

### Hooks
```typescript
import { useStatistics, useHealth } from '../hooks/useAdmin';
import { useUsers } from '../hooks/useUsers';

// Available hooks:
// - useStatistics() → { statistics, loading, refetch }
// - useHealth() → { health, loading, refetch }
// - useUsers(page, pageSize) → { data, loading, refetch }
```

### Component Dependencies
```typescript
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
```

### Data Flow
```
┌─────────────────────┐
│   useHealth()       │  → [API Status] [DB Status]
├─────────────────────┤
│ useStatistics()     │  → [Users] [Courses] [Enrollments] [Completion]
├─────────────────────┤
│ useUsers(1, 100)    │  → [Users Table] [Bulk Selection]
├─────────────────────┤
│ adminService        │  → Bulk update operations
└─────────────────────┘
```

---

## UI Layout Structure

```
┌─────────────────────────────────────────┐
│  Admin Panel                     [Refresh]│
│  System management                      │
└─────────────────────────────────────────┘

System Health
┌──────────┬──────────┬──────────┬────────┐
│   API    │Database  │ Uptime   │Sessions│
│ 🌐       │ 💾       │ ⏱️       │ 👥    │
│ Healthy  │ Healthy  │ 24h 15m  │ 45    │
└──────────┴──────────┴──────────┴────────┘

Statistics Dashboard
┌──────────┬──────────┬──────────┬────────┐
│  Users   │ Courses  │Enroll.   │Complet.│
│ 👤       │ 📚       │ 📝       │ ✅    │
│   47     │   18     │   152    │ 42.8% │
│ Active45 │ Req 6    │ Act 67   │ 65/152│
│ Inact 2  │ Opt 12   │ Compl 65 │      │
└──────────┴──────────┴──────────┴────────┘

Bulk User Operations
┌────────────────────────────────────────┐
│ 3 user(s) selected                     │
│ [Activate Selected] [Deactivate Select]│
│ Success message (if any)               │
├────────────────────────────────────────┤
│ ☑ Select | User        │ Status │ Date │
├────────────────────────────────────────┤
│ ☑ user-1 │ John Doe    │Active  │1/1/26│
│ ☑ user-2 │ Jane Smith  │Active  │1/2/26│
│ ☐ user-3 │ Bob Wilson  │Inactive│1/3/26│
│ ... more rows ...                      │
└────────────────────────────────────────┘
```

---

## Error Handling

### Bulk Action Validation
```typescript
if (selectedUserIds.size === 0) {
  setBulkActionMessage('Please select at least one user');
  return;  // No API call
}
```

### Confirmation Dialog
```typescript
const confirmMessage = action === 'activate'
  ? `Are you sure you want to activate ${selectedUserIds.size} user(s)?`
  : `Are you sure you want to deactivate ${selectedUserIds.size} user(s)?`;

if (!confirm(confirmMessage)) {
  return;  // User cancelled
}
```

### Partial Failure Handling
```typescript
const result = {
  successCount: 7,
  failedCount: 3,
  errors: [
    { userId: 'user-50', error: 'User has active enrollments' },
    // ... more errors ...
  ]
};

setBulkActionMessage(
  `Success: ${result.successCount} user(s) updated. Failed: ${result.failedCount}.`
);

if (result.errors.length > 0) {
  console.error('Bulk update errors:', result.errors);
}
```

### API Error Handling
```typescript
try {
  const result = await adminService.bulkUpdateUserStatus({...});
} catch (error) {
  setBulkActionMessage(
    `Error: ${error instanceof Error ? error.message : 'Failed to update users'}`
  );
  console.error('Bulk action error:', error);
}
```

### Message Display
```tsx
{bulkActionMessage && (
  <div className={`mb-4 p-3 rounded-md text-sm ${
    bulkActionMessage.startsWith('Success')
      ? 'bg-green-50 text-green-800'
      : bulkActionMessage.startsWith('Error')
      ? 'bg-red-50 text-red-800'
      : 'bg-yellow-50 text-yellow-800'
  }`}>
    {bulkActionMessage}
  </div>
)}
```

---

## Performance Considerations

### Data Fetching Strategy
```typescript
// Fetch users with limit to prevent loading 1000+ users
const { data: usersData } = useUsers(1, 100);  // Max 100 users

// Table with 100 users is still manageable
// Bulk operations work efficiently on Set<string>
```

### Memoization
- No explicit useMemo needed (simple component)
- All rendering is direct from state/props
- Selection is fast Set operation (O(1))

### Set-based Selection
```typescript
// O(1) operations for selection
const newSelected = new Set(selectedUserIds);
newSelected.add(userId);
newSelected.delete(userId);
setSelectedUserIds(newSelected);

// O(n) conversion only when needed
const userIds = Array.from(selectedUserIds);  // For API call
```

---

## Testing Examples

### Unit Test - Health Status Display
```typescript
describe('AdminPanel - Health Status', () => {
  it('should display health status badges', async () => {
    const mockHealth = {
      apiStatus: 'Healthy',
      databaseStatus: 'Unhealthy',
    };
    
    jest.mock('../hooks/useAdmin', () => ({
      useHealth: () => ({ health: mockHealth, loading: false })
    }));

    render(<AdminPanel />);
    
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
  });
});
```

### Integration Test - Select Single User
```typescript
describe('AdminPanel - Select User', () => {
  it('should select user when checkbox clicked', async () => {
    render(<AdminPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[1];  // First user checkbox
    fireEvent.click(checkbox);

    expect(screen.getByText('1 user(s) selected')).toBeInTheDocument();
  });
});
```

### Integration Test - Bulk Activate
```typescript
describe('AdminPanel - Bulk Activate', () => {
  it('should activate multiple users', async () => {
    const mockBulkUpdate = jest.fn();
    
    render(<AdminPanel />);
    
    // Select 3 users
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(checkboxes[3]);

    // Click activate button
    global.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByText('✅ Activate Selected'));

    await waitFor(() => {
      expect(mockBulkUpdate).toHaveBeenCalledWith({
        userIds: ['user-1', 'user-2', 'user-3'],
        isActive: true,
      });
    });
  });
});
```

---

## Accessibility

### Keyboard Navigation
- Tab through health cards and statistics
- Tab through table rows
- Space/Enter to toggle checkboxes
- Tab to action buttons

### Screen Reader Support
```tsx
<input
  type="checkbox"
  aria-label={`Select ${user.fullName}`}
  checked={selectedUserIds.has(user.id)}
  onChange={(e) => handleSelectUser(user.id, e.target.checked)}
/>

// Screen reader announces: "Select John Doe"
```

### Color Contrast
- Health badges: Green, Red, Gray have good contrast
- Status badges: Green (Active), Gray (Inactive) have good contrast
- Text meets WCAG AA standards

### Semantic Table
```tsx
<table>
  <thead>
    <tr>
      <th>Select</th>
      <th>User</th>
      <th>Status</th>
      <th>Created</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Checkbox</td>
      <td>User Info</td>
      <td>Status Badge</td>
      <td>Date</td>
    </tr>
  </tbody>
</table>
```

---

## Related Documentation

- **[useAdmin Hook](../hooks/useAdmin_doc.md)** - Health and statistics data
- **[useUsers Hook](../hooks/useUsers_doc.md)** - User data fetching
- **[adminService](../services/adminService_doc.md)** - Bulk operations
- **[Button Component](../components/Button_doc.md)** - Button styling
- **[Card Component](../components/Card_doc.md)** - Card layout
- **[Layout Component](../components/Layout_doc.md)** - Page wrapper

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-24 | Initial documentation |

## Author

Frontend Team | Last Updated: January 24, 2026
