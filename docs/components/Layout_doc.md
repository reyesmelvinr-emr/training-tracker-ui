# Layout Component Documentation

## Component Overview

**File:** `src/components/common/Layout.tsx`  
**Type:** UI Component (Layout Container)  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Main application layout component providing consistent navigation structure, sidebar menu, user information display, and content area wrapper. Serves as the primary page template for the entire application.

### Key Features
- Persistent sidebar navigation
- User information display
- Role-based menu items
- Active route highlighting
- Logout functionality
- Responsive layout structure
- React Router integration

---

## Props/Inputs

### LayoutProps Interface
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

### Props Definition

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Page content to render in main area |

---

## State

### Component State
The component itself is **stateless**. State is managed through:

- **AuthContext:** User information and logout functionality
- **React Router:** Current route and navigation

### Context Dependencies
```typescript
const { user, logout } = useAuth();
```

**Consumed State:**
- `user.email` - User's email address
- `user.role` - User's role (e.g., 'Admin', 'User')
- `logout()` - Logout function

---

## Events/Outputs

### Event Handlers

#### `handleLogout()`
Logs out the current user and redirects to dashboard.

```typescript
const handleLogout = () => {
  logout();
  navigate('/dashboard');
};
```

**Trigger:** Click on logout button  
**Actions:** 
1. Calls `logout()` from AuthContext
2. Navigates to `/dashboard` route

---

## Navigation Structure

### Sidebar Menu Items

| Route | Label | Icon | Visibility | Description |
|-------|-------|------|------------|-------------|
| `/dashboard` | Dashboard | 📊 | All users | Main dashboard view |
| `/courses` | Courses | 📚 | All users | Course catalog |
| `/users` | Users | 👥 | All users | User management |
| `/enrollments` | Enrollments | 📝 | All users | Enrollment tracking |
| `/admin` | Admin | ⚙️ | Admin only | Admin panel |

### Active State Management
Uses React Router's `NavLink` with `isActive` callback:

```typescript
className={({ isActive }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}
```

---

## Styling

### CSS Module
**File:** `Layout.module.css`

### CSS Classes
- `.layout` - Main layout container (flex/grid)
- `.sidebar` - Sidebar navigation column
- `.sidebarHeader` - Sidebar header section
- `.logo` - Application logo/title
- `.userInfo` - User information display
- `.userName` - User email display
- `.userRole` - User role badge
- `.nav` - Navigation menu container
- `.navLink` - Navigation link styles
- `.active` - Active navigation link styles
- `.icon` - Icon styles in nav items
- `.sidebarFooter` - Sidebar footer section
- `.logoutButton` - Logout button styles
- `.mainContent` - Main content area
- `.header` - Page header
- `.breadcrumb` - Breadcrumb display
- `.content` - Page content wrapper

### Layout Structure
```
┌────────────┬──────────────────────────────────┐
│            │ .header                          │
│  .sidebar  ├──────────────────────────────────┤
│            │                                  │
│  Navigation│      .content (children)         │
│            │                                  │
│            │                                  │
│  .footer   │                                  │
└────────────┴──────────────────────────────────┘
```

---

## Accessibility

### Semantic HTML
- `<aside>` for sidebar navigation
- `<nav>` for navigation menu
- `<header>` for page header
- `<main>` for main content

### Keyboard Navigation
✅ All links focusable and keyboard accessible  
✅ Tab order follows logical flow  
✅ Active state clearly visible  

### Screen Reader Support
- Semantic HTML provides context
- NavLink provides active state announcement
- Button elements for interactive items

---

## Usage Examples

### Basic Layout Usage
```typescript
import { Layout } from '@/components/common/Layout';

function DashboardPage() {
  return (
    <Layout>
      <h1>Dashboard</h1>
      <div>Dashboard content here...</div>
    </Layout>
  );
}
```

---

### Multiple Pages with Layout
```typescript
// App.tsx routing
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <Layout>
          <Dashboard />
        </Layout>
      } />
      
      <Route path="/courses" element={
        <Layout>
          <CourseCatalog />
        </Layout>
      } />
      
      <Route path="/users" element={
        <Layout>
          <Users />
        </Layout>
      } />
    </Routes>
  );
}
```

---

### With Authentication Check
```typescript
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
}
```

---

### Admin-Only Pages
```typescript
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <Layout>{children}</Layout>;
}

// Usage
<Route path="/admin" element={
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
} />
```

---

## Integration Points

### Dependencies

#### Internal Dependencies
- `@/context/AuthContext` - User authentication state
- `@/components/common/Layout.module.css` - Component styles

#### External Dependencies
- `react-router-dom` - Navigation and routing
  - `NavLink` - Active navigation links
  - `useNavigate` - Programmatic navigation

### Used By
- **All application pages** (Dashboard, Courses, Users, etc.)
- Wraps main content area for consistent UI

### Provides To Children
- Consistent navigation
- Page header structure
- User context awareness
- Logout functionality

---

## Navigation Behavior

### Active Link Highlighting
NavLink automatically applies active styles when route matches:

```typescript
// Current route: /courses
<NavLink to="/courses" className={...}>
  // This link will have .active class
</NavLink>
```

---

### Role-Based Navigation
Admin link only visible to admin users:

```typescript
{user?.role === 'Admin' && (
  <NavLink to="/admin">
    Admin
  </NavLink>
)}
```

---

### Programmatic Navigation
```typescript
const navigate = useNavigate();

// After action
handleSave().then(() => {
  navigate('/courses');
});
```

---

## User Information Display

### User Info Section
```typescript
{user && (
  <div className={styles.userInfo}>
    <div className={styles.userName}>{user.email}</div>
    <div className={styles.userRole}>{user.role}</div>
  </div>
)}
```

**Displays:**
- User email (e.g., "john.doe@emerson.com")
- User role (e.g., "Admin", "User")

**Conditional Rendering:**
- Only shown when user is authenticated
- Updates automatically when auth state changes

---

## Logout Functionality

### Logout Flow
1. User clicks logout button
2. `handleLogout()` called
3. `logout()` from AuthContext clears auth state
4. User redirected to `/dashboard`

### Implementation
```typescript
const handleLogout = () => {
  logout(); // Clear auth state
  navigate('/dashboard'); // Redirect
};

return (
  <button onClick={handleLogout} className={styles.logoutButton}>
    🚪 Logout
  </button>
);
```

---

## Design Patterns

### Layout Wrapper Pattern
```typescript
// Higher-order component pattern
function withLayout(Component) {
  return function LayoutWrapper(props) {
    return (
      <Layout>
        <Component {...props} />
      </Layout>
    );
  };
}

// Usage
const DashboardWithLayout = withLayout(Dashboard);
```

---

### Nested Routing with Layout
```typescript
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
}

// Layout component with Outlet
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>...</aside>
      <main className={styles.mainContent}>
        <Outlet /> {/* Renders nested routes */}
      </main>
    </div>
  );
}
```

---

## Responsive Design Considerations

### Mobile-First Approach
```css
/* Mobile: Stacked layout */
.layout {
  display: flex;
  flex-direction: column;
}

/* Desktop: Side-by-side */
@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
  
  .sidebar {
    width: 250px;
  }
}
```

---

### Collapsible Sidebar (Future Enhancement)
```typescript
const [sidebarOpen, setSidebarOpen] = useState(true);

return (
  <div className={styles.layout}>
    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
      ☰ Menu
    </button>
    
    <aside className={sidebarOpen ? styles.sidebar : styles.sidebarCollapsed}>
      {/* navigation */}
    </aside>
  </div>
);
```

---

## Testing

### Test Scenarios
1. Renders sidebar navigation
2. Displays user information when authenticated
3. Hides user info when not authenticated
4. Shows admin link only for admin users
5. Highlights active navigation link
6. Calls logout on button click
7. Renders children in main content area

### Example Tests
```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from './Layout';

describe('Layout', () => {
  it('displays user information', () => {
    const mockUser = { email: 'test@emerson.com', role: 'Admin' };
    
    render(
      <AuthProvider value={{ user: mockUser, logout: jest.fn() }}>
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(screen.getByText('test@emerson.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
  
  it('shows admin link for admin users', () => {
    const mockUser = { email: 'admin@emerson.com', role: 'Admin' };
    
    render(
      <AuthProvider value={{ user: mockUser, logout: jest.fn() }}>
        <BrowserRouter>
          <Layout><div /></Layout>
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
  
  it('hides admin link for regular users', () => {
    const mockUser = { email: 'user@emerson.com', role: 'User' };
    
    render(
      <AuthProvider value={{ user: mockUser, logout: jest.fn() }}>
        <BrowserRouter>
          <Layout><div /></Layout>
        </BrowserRouter>
      </AuthProvider>
    );
    
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
```

---

## Performance Considerations

### Optimization Opportunities
```typescript
// Memoize navigation items
const navItems = useMemo(() => [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/courses', label: 'Courses', icon: '📚' },
  // ...
], []);

// Only re-render when necessary
const MemoizedLayout = memo(Layout);
```

---

### Avoid Re-renders
Since Layout wraps all pages, unnecessary re-renders affect performance:

```typescript
// Good: Stable references
const logout = useCallback(() => {
  // logout logic
}, []);

// Bad: New function every render
const logout = () => {
  // logout logic
};
```

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- CSS Flexbox/Grid
- React 18+
- React Router v6+

---

## Future Enhancements

### Potential Improvements
1. **Collapsible sidebar:** Mobile-friendly toggle
2. **Breadcrumb navigation:** Dynamic breadcrumbs based on route
3. **Theme switcher:** Light/dark mode toggle
4. **Notification center:** Badge count on bell icon
5. **User menu:** Dropdown with profile/settings
6. **Search:** Global search in header

### Example Future Features
```typescript
<Layout 
  sidebarCollapsible
  breadcrumbs={<Breadcrumbs />}
  headerActions={
    <>
      <NotificationBell count={5} />
      <ThemeToggle />
      <UserMenu />
    </>
  }
>
  {children}
</Layout>
```

---

## Common Issues & Solutions

### Issue: NavLink not highlighting
**Solution:** Ensure routes match exactly
```typescript
// Use 'end' prop for exact matches
<NavLink to="/dashboard" end>
  Dashboard
</NavLink>
```

---

### Issue: Logout not clearing state
**Solution:** Ensure AuthContext properly clears all auth data
```typescript
const logout = () => {
  localStorage.removeItem('token');
  setUser(null);
  // Clear any other auth-related state
};
```

---

## Related Documentation
- [Auth Context](../context/AuthContext_doc.md) - Authentication state management
- [App Component](../pages/App_doc.md) - Main routing configuration
- [Button Component](./Button_doc.md) - Logout button
- [Card Component](./Card_doc.md) - Content containers

---

## Maintenance & Support

**Owner:** Frontend Team  
**Tech Lead:** melvin.reyes@emerson.com  
**Last Review:** January 23, 2026

---

<!-- AKR Documentation Metadata -->
<!-- Generated: 2026-01-23 -->
<!-- Template: ui-component -->
<!-- AI-Generated: true -->
