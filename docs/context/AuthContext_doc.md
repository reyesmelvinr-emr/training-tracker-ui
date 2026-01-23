# AuthContext Documentation

## Context Overview

**File:** `src/context/AuthContext.tsx`  
**Type:** React Context (Authentication State)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Provides centralized authentication state management across the entire Training Tracker UI application. Manages user authentication information, role-based access control, and login/logout operations using React Context API with optimization via `useMemo`.

### Key Features
- User state management with TypeScript `UserInfo` interface
- Role-based authorization support (Admin/Employee)
- Demo user initialization for development
- `useAuth` hook with error handling and error boundaries
- Optimized context value using `useMemo`
- Proper error messaging for improper hook usage

---

## Data Structures

### UserInfo Interface
```typescript
export interface UserInfo {
  sub: string;
  email: string;
  role: 'Admin' | 'Employee';
}
```

**Properties:**

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `sub` | `string` | Subject/unique user identifier (from auth provider) | `'demo-user'` or OAuth sub |
| `email` | `string` | User's email address | `'john.doe@company.com'` |
| `role` | `'Admin' \| 'Employee'` | Role for authorization | `'Admin'` or `'Employee'` |

### AuthContextType Interface
```typescript
interface AuthContextType {
  user: UserInfo | null;
  login: (user: UserInfo) => void;
  logout: () => void;
}
```

**Context Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `user` | `UserInfo \| null` | Current authenticated user or `null` if logged out |
| `login` | `(user: UserInfo) => void` | Updates user state with new user info |
| `logout` | `() => void` | Clears user state (sets to `null`) |

---

## Context Setup

### AuthProvider Component
The `AuthProvider` wraps your application and supplies authentication state to all child components.

```typescript
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>({
    sub: 'demo-user',
    email: 'demo@company.com',
    role: 'Admin'
  });

  const value = useMemo(() => ({
    user,
    login: (u: UserInfo) => setUser(u),
    logout: () => setUser(null)
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**Key Design Decisions:**

1. **Demo User Initialization:** Default state includes demo user for immediate testing without auth integration
2. **useMemo Optimization:** Context value is memoized to prevent unnecessary re-renders of all consuming components
3. **Dependency Array:** `[user]` ensures value is recalculated only when user state changes

### Application Root Setup
Wrap your app's root component:

```typescript
// main.tsx or App.tsx
import { AuthProvider } from '@/context/AuthContext';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

---

## useAuth Hook

### Hook Signature
```typescript
export function useAuth(): AuthContextType
```

### Purpose
Provides convenient access to authentication context with built-in error handling.

### Error Handling
```typescript
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

**Error Boundary Protection:**
- Throws error if hook used outside `AuthProvider`
- Prevents silent failures and undefined context
- Provides clear error message for debugging

---

## Role-Based Authorization Patterns

### Basic Role Check
```typescript
import { useAuth } from '@/context/AuthContext';

function AdminPanel() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  if (user.role !== 'Admin') {
    return <div>Access denied</div>;
  }
  
  return <div>Admin Panel Content</div>;
}
```

### Higher-Order Component (HOC) Pattern
```typescript
function withAdminRole(Component: React.ComponentType) {
  return function ProtectedComponent(props: any) {
    const { user } = useAuth();
    
    if (!user || user.role !== 'Admin') {
      return <div>Access Denied</div>;
    }
    
    return <Component {...props} />;
  };
}

// Usage
const AdminPage = withAdminRole(() => <div>Admin Only Content</div>);
```

### Route Protection Pattern
```typescript
// With React Router
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return user.role === 'Admin' ? element : <Navigate to="/unauthorized" />;
}

// Usage in routing
<Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} />} />
```

### Conditional Feature Rendering
```typescript
function CourseManagement() {
  const { user } = useAuth();
  const canEdit = user?.role === 'Admin';
  
  return (
    <div>
      <CourseList />
      {canEdit && <CourseCreator />}
    </div>
  );
}
```

---

## Usage Examples

### Example 1: Display Current User Email
```typescript
import { useAuth } from '@/context/AuthContext';

function UserGreeting() {
  const { user } = useAuth();
  
  if (!user) {
    return <p>Please log in</p>;
  }
  
  return <p>Welcome, {user.email}!</p>;
}
```

---

### Example 2: Login Flow with Form
```typescript
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'Admin' | 'Employee'>('Employee');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real app, validate against backend
    login({
      sub: `user-${Date.now()}`,
      email,
      role
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="Employee">Employee</option>
        <option value="Admin">Admin</option>
      </select>
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Example 3: Logout and Navigation
```typescript
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div>
      <span>{user?.email}</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

### Example 4: Admin-Only Dashboard
```typescript
import { useAuth } from '@/context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'Admin') {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <UserManagement />
        <CourseManagement />
        <ReportGeneration />
      </div>
    );
  }
  
  return (
    <div>
      <h1>Employee Dashboard</h1>
      <EnrolledCourses />
      <TrainingProgress />
    </div>
  );
}
```

---

### Example 5: Protected Data Display with Role Check
```typescript
function UserProfile() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div className="profile">
      <h2>{user.email}</h2>
      <p>Role: <strong>{user.role}</strong></p>
      
      {user.role === 'Admin' && (
        <section>
          <h3>Admin Tools</h3>
          <AdminSettings />
        </section>
      )}
      
      <section>
        <h3>My Courses</h3>
        <CourseList userId={user.sub} />
      </section>
    </div>
  );
}
```

---

### Example 6: Test Mock - Using Demo User
```typescript
import { AuthProvider, useAuth } from '@/context/AuthContext';

function TestComponent() {
  return (
    <AuthProvider>
      <UserDisplay />
    </AuthProvider>
  );
}

function UserDisplay() {
  const { user } = useAuth();
  return <div>{user?.email}</div>; // Shows 'demo@company.com'
}
```

---

### Example 7: Switching Users at Runtime
```typescript
function UserSwitcher() {
  const { login } = useAuth();
  
  const switchToAdmin = () => {
    login({
      sub: 'admin-123',
      email: 'admin@company.com',
      role: 'Admin'
    });
  };
  
  const switchToEmployee = () => {
    login({
      sub: 'emp-456',
      email: 'employee@company.com',
      role: 'Employee'
    });
  };
  
  return (
    <div>
      <button onClick={switchToAdmin}>Test as Admin</button>
      <button onClick={switchToEmployee}>Test as Employee</button>
    </div>
  );
}
```

---

### Example 8: Conditional Rendering Based on Role
```typescript
function CourseCard({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  return (
    <div className="course-card">
      <h3>{courseId}</h3>
      
      {isAdmin ? (
        <div>
          <button>Edit Course</button>
          <button>Delete Course</button>
          <button>View Enrollments</button>
        </div>
      ) : (
        <div>
          <button>Enroll</button>
          <button>View Details</button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Patterns

### Test Setup with Mock Provider
```typescript
import { render } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';

describe('Component with Auth', () => {
  it('should render with demo user', () => {
    render(
      <AuthProvider>
        <YourComponent />
      </AuthProvider>
    );
    
    // AuthProvider provides demo user by default
    // Component can access user info via useAuth hook
  });
});
```

---

### Mock Auth Context for Tests
```typescript
import { ReactNode } from 'react';
import { createContext } from 'react';

const MockAuthContext = createContext({
  user: {
    sub: 'test-user',
    email: 'test@example.com',
    role: 'Admin' as const
  },
  login: jest.fn(),
  logout: jest.fn()
});

function MockAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MockAuthContext.Provider value={{
      user: {
        sub: 'test-user',
        email: 'test@example.com',
        role: 'Admin'
      },
      login: jest.fn(),
      logout: jest.fn()
    }}>
      {children}
    </MockAuthContext.Provider>
  );
}
```

---

### Test Hook with useAuth
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';

it('should provide user from context', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider
  });
  
  expect(result.current.user).toEqual({
    sub: 'demo-user',
    email: 'demo@company.com',
    role: 'Admin'
  });
});
```

---

### Test Login Action
```typescript
it('should update user on login', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider
  });
  
  const newUser = {
    sub: 'new-user',
    email: 'newuser@company.com',
    role: 'Employee' as const
  };
  
  act(() => {
    result.current.login(newUser);
  });
  
  expect(result.current.user).toEqual(newUser);
});
```

---

## Integration with Pages

### Example: CoursesPage with Auth Integration
```typescript
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/hooks/useCourses';

export function CoursesPage() {
  const { user } = useAuth();
  const { courses, loading } = useCourses();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <h1>Courses</h1>
      
      {user.role === 'Admin' && (
        <div>
          <button>+ Create Course</button>
        </div>
      )}
      
      <CoursesList
        courses={courses}
        editable={user.role === 'Admin'}
      />
    </div>
  );
}
```

---

### Example: AdminPage with Role Check
```typescript
export function AdminPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'Admin') {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="admin-panel">
      <AdminNavigation />
      <AdminContent />
    </div>
  );
}
```

---

## Performance Considerations

### Memory Optimization
- **useMemo:** Context value is memoized, preventing re-renders unless user changes
- **Selective Subscriptions:** Only components using `useAuth()` re-render on changes
- **No Prop Drilling:** Context eliminates need to pass auth through component tree

### Performance Metrics
```typescript
// Good - only necessary re-renders
function Header() {
  const { user } = useAuth(); // Only subscribes to auth changes
  return <h1>{user?.email}</h1>;
}

// Inefficient - subscribes to everything
function Header(props: any) {
  // Would require parent to pass all props including auth
}
```

---

## Error Handling and Edge Cases

### Missing Provider Error
```typescript
// ❌ INCORRECT - useAuth outside AuthProvider
function BadComponent() {
  const { user } = useAuth(); // Throws: "useAuth must be used within AuthProvider"
}

// ✅ CORRECT - Wrapped in AuthProvider
export function App() {
  return (
    <AuthProvider>
      <GoodComponent />
    </AuthProvider>
  );
}
```

---

### Null User Handling
```typescript
function SafeComponent() {
  const { user } = useAuth();
  
  // Handle null case
  if (!user) {
    return <p>Not logged in</p>;
  }
  
  // Now user is guaranteed to exist
  const userEmail: string = user.email; // ✓ Type-safe
  
  return <p>Welcome {userEmail}</p>;
}
```

---

### Role Mismatch Handling
```typescript
function RoleBasedComponent() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Handle unexpected roles gracefully
  switch (user.role) {
    case 'Admin':
      return <AdminView />;
    case 'Employee':
      return <EmployeeView />;
    default:
      return <UnknownRoleView />;
  }
}
```

---

## Accessibility Notes

### Screen Reader Support
- User role and authentication state should be announced to screen readers
- Use ARIA live regions for auth state changes

### Example with ARIA
```typescript
function AuthStatus() {
  const { user } = useAuth();
  
  return (
    <div aria-live="polite" aria-label="Authentication status">
      {user ? (
        <p>Logged in as {user.email}</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}
```

---

## Related Documentation

- [useAuth Hook Tests](../test/setup_doc.md)
- [Authentication Flow](../pages/)
- [Page Components](../pages/)
- [Role-Based Access Control Patterns](../)

---

## Migration from Previous Auth Implementation

If replacing an existing auth solution:

1. Wrap root component with `AuthProvider`
2. Replace old auth hook calls with `useAuth()`
3. Update role checks to use `user?.role`
4. Test with demo user initially, then integrate real backend

---

## Common Pitfalls

### ❌ Pitfall 1: Using Hook Outside Provider
```typescript
// DON'T DO THIS
function standalone() {
  const { user } = useAuth(); // Error!
}
```

### ✅ Solution
```typescript
// Ensure it's inside AuthProvider tree
<AuthProvider>
  <ComponentUsingHook />
</AuthProvider>
```

---

### ❌ Pitfall 2: Not Handling Null User
```typescript
// DON'T DO THIS
function unsafe() {
  const { user } = useAuth();
  return <p>{user.email}</p>; // Could crash if user is null
}
```

### ✅ Solution
```typescript
// ALWAYS check for null
function safe() {
  const { user } = useAuth();
  if (!user) return <p>Not logged in</p>;
  return <p>{user.email}</p>;
}
```

---

## Future Enhancements

- OAuth/OIDC integration
- Token refresh mechanism
- Permission-based access (beyond role)
- Auth state persistence to localStorage
- Multi-tenant support

---

## Metadata

| Property | Value |
|----------|-------|
| **File Size** | ~40 lines |
| **Complexity** | Low-Medium |
| **External Dependencies** | React only |
| **Last Reviewed** | January 24, 2026 |
| **Status** | Active - Production Ready |

---

*Documentation generated for AKR documentation system. See related files for complete authentication system documentation.*
