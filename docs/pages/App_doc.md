# App Component Documentation

## Overview

**File:** `src/pages/App.tsx`  
**Type:** React Component (Root Router)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Root application component providing client-side routing configuration using React Router v6. Manages route definitions, navigation rules, and implements role-based route protection for admin pages.

### Key Features
- Declarative routing with React Router v6
- Protected admin routes with role validation
- Automatic redirect from root to dashboard
- 404 Not Found fallback
- Role-based access control (RBAC)

---

## Component Architecture

### Routes Configuration

```
/ (root)
├── → /dashboard (redirect)
├── /dashboard          → Dashboard page
├── /courses            → CourseCatalog page
├── /users              → Users page
├── /enrollments        → Enrollments page
├── /admin              → AdminPanel page (protected)
└── * (fallback)        → NotFound page
```

---

## Component Signature

```typescript
function App(): JSX.Element
```

### No Props
This is the root component and accepts no props.

---

## Dependencies

### Internal Components
- `Dashboard` - User training overview page
- `CourseCatalog` - Course browsing and management
- `Users` - User management page
- `Enrollments` - Enrollment management page
- `AdminPanel` - Administrative dashboard
- `NotFound` - 404 error page
- `useAuth` - Authentication context hook

### External Libraries
- `react-router-dom` - Client-side routing
  - `Routes` - Route container
  - `Route` - Individual route definition
  - `Navigate` - Programmatic navigation component

---

## Route Definitions

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Navigate` | Redirects to `/dashboard` |
| `/dashboard` | `Dashboard` | User's training overview |
| `/courses` | `CourseCatalog` | Browse and manage courses |
| `/users` | `Users` | Manage system users |
| `/enrollments` | `Enrollments` | Manage course enrollments |

### Protected Routes
| Path | Component | Access | Redirect |
|------|-----------|--------|----------|
| `/admin` | `AdminPanel` | Admin role only | `/dashboard` if unauthorized |

### Fallback
| Path | Component | Description |
|------|-----------|-------------|
| `*` | `NotFound` | 404 page for unknown routes |

---

## AdminRoute Guard Component

### Purpose
Higher-order component that protects admin routes by checking user role before rendering children.

### Signature
```typescript
function AdminRoute({ children }: { children: JSX.Element }): JSX.Element
```

### Logic
1. Retrieves current user from `useAuth()` context
2. Checks if user exists and has `role === 'Admin'`
3. If authorized: renders `children` (AdminPanel)
4. If unauthorized: redirects to `/dashboard` with `replace` flag

### Example
```typescript
<Route 
  path="/admin" 
  element={<AdminRoute><AdminPanel /></AdminRoute>} 
/>
```

---

## Usage Examples

### Basic Usage
```typescript
import { BrowserRouter } from 'react-router-dom';
import { App } from './pages/App';
import { AuthProvider } from './context/AuthContext';

function Root() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

### Adding a New Route
```typescript
import { NewPage } from './NewPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-page" element={<NewPage />} /> {/* Add here */}
      {/* ... other routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

---

### Adding a Protected Route
```typescript
<Route 
  path="/manager" 
  element={
    <ManagerRoute>
      <ManagerPanel />
    </ManagerRoute>
  } 
/>

// Define guard component
function ManagerRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || (user.role !== 'Admin' && user.role !== 'Manager')) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
```

---

### Programmatic Navigation
```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/courses');
  };
  
  return <button onClick={handleClick}>View Courses</button>;
}
```

---

### Route Parameters
```typescript
// Add parameterized route
<Route path="/courses/:courseId" element={<CourseDetail />} />

// Access params in component
import { useParams } from 'react-router-dom';

function CourseDetail() {
  const { courseId } = useParams();
  return <div>Course ID: {courseId}</div>;
}
```

---

### Nested Routes
```typescript
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
</Route>

// In DashboardLayout
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div>
      <nav>{/* Dashboard nav */}</nav>
      <Outlet /> {/* Nested routes render here */}
    </div>
  );
}
```

---

### Conditional Redirects
```typescript
function ConditionalRedirect() {
  const { user } = useAuth();
  const isOnboarded = user?.metadata?.hasCompletedOnboarding;
  
  return isOnboarded ? <Dashboard /> : <Navigate to="/onboarding" />;
}
```

---

## Role-Based Access Control (RBAC)

### Current Roles
- `Admin` - Full system access including admin panel
- `Employee` - Standard user access (implicit default)

### Access Matrix
| Route | Admin | Employee |
|-------|-------|----------|
| `/dashboard` | ✅ | ✅ |
| `/courses` | ✅ | ✅ |
| `/users` | ✅ | ✅ |
| `/enrollments` | ✅ | ✅ |
| `/admin` | ✅ | ❌ (redirects) |

### Extending RBAC
```typescript
// Add new role check
function SuperAdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || user.role !== 'SuperAdmin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Use in routes
<Route 
  path="/system-config" 
  element={
    <SuperAdminRoute>
      <SystemConfig />
    </SuperAdminRoute>
  } 
/>
```

---

## Integration Points

### Dependencies
- `AuthContext` - Provides user authentication state and role
- `react-router-dom` - Client-side routing library

### Used By
- `main.tsx` - Wraps App with BrowserRouter and AuthProvider
- All page components - Rendered by route definitions

### Provides
- Routing infrastructure for entire application
- Protected route patterns for RBAC
- Navigation structure

---

## Navigation Flow

```
User lands on app
        ↓
    App.tsx loads
        ↓
   Check current URL
        ↓
   ┌─────────────┬─────────────┬─────────────┐
   ↓             ↓             ↓             ↓
Root (/)    Public Route   Admin Route   Unknown
   ↓             ↓             ↓             ↓
Redirect    Render page   Check role    NotFound
   ↓                          ↓
Dashboard              ┌──────┴──────┐
                       ↓             ↓
                   Authorized   Unauthorized
                       ↓             ↓
                  AdminPanel    Redirect /dashboard
```

---

## Error Handling

### 404 Not Found
All unmatched routes render the NotFound component:

```typescript
<Route path="*" element={<NotFound />} />
```

### Unauthorized Access
Protected routes redirect to dashboard:

```typescript
if (!user || user.role !== 'Admin') {
  return <Navigate to="/dashboard" replace />;
}
```

### Missing Auth Context
The `useAuth()` hook throws error if used outside `AuthProvider`:

```typescript
// In useAuth hook
if (!ctx) throw new Error('useAuth must be used within AuthProvider');
```

---

## Performance Considerations

### Code Splitting
Split routes into lazy-loaded chunks:

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const AdminPanel = lazy(() => import('./AdminPanel'));

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Routes>
    </Suspense>
  );
}
```

---

## Testing

### Example Tests
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { App } from './App';

describe('App Routing', () => {
  it('redirects root to dashboard', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(window.location.pathname).toBe('/dashboard');
  });
  
  it('blocks admin route for non-admin users', () => {
    const mockUser = { sub: '1', email: 'user@test.com', role: 'Employee' as const };
    
    render(
      <AuthProvider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <BrowserRouter initialEntries={['/admin']}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(window.location.pathname).toBe('/dashboard');
  });
  
  it('allows admin route for admin users', () => {
    const mockUser = { sub: '1', email: 'admin@test.com', role: 'Admin' as const };
    
    render(
      <AuthProvider value={{ user: mockUser, login: jest.fn(), logout: jest.fn() }}>
        <BrowserRouter initialEntries={['/admin']}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
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
- ES6 (arrow functions, destructuring)
- React 18+ with JSX
- React Router v6
- Context API

---

## Related Documentation
- [Dashboard Page](./Dashboard_doc.md) - Main user landing page
- [AdminPanel Page](./AdminPanel_doc.md) - Admin-only dashboard
- [AuthContext](../context/AuthContext_doc.md) - Authentication state management
- [Layout Component](../components/Layout_doc.md) - Shared page layout

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
