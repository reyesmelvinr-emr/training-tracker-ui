# StatusBadge Component Documentation

## Component Overview

**File:** `src/components/common/StatusBadge.tsx`  
**Type:** UI Component (Badge/Indicator)  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Visual status indicator component displaying colored badges with semantic meaning. Used to communicate status, state, or importance levels throughout the application with built-in accessibility support.

### Key Features
- Four semantic tone variants (success, warning, danger, info)
- Accessible status indicators with ARIA labels
- Flexible content support
- CSS Module styling
- Screen reader friendly

---

## Props/Inputs

### StatusBadgeProps Interface
```typescript
interface StatusBadgeProps {
  tone: BadgeTone;
  children: React.ReactNode;
  ariaLabel?: string;
}
```

### Props Definition

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tone` | `'success' \| 'warning' \| 'danger' \| 'info'` | Yes | Visual and semantic tone |
| `children` | `React.ReactNode` | Yes | Badge content/label |
| `ariaLabel` | `string` | No | Custom ARIA label for screen readers |

### Type Definitions

#### BadgeTone
```typescript
type BadgeTone = 'success' | 'warning' | 'danger' | 'info';
```

**Tone Descriptions:**

| Tone | Color (Typical) | Use Cases |
|------|-----------------|-----------|
| `success` | Green | Completed, Active, Approved, Available |
| `warning` | Yellow/Orange | Pending, Expiring Soon, Needs Attention |
| `danger` | Red | Failed, Cancelled, Error, Inactive |
| `info` | Blue | Informational, In Progress, Scheduled |

---

## State

### Component State
The component is **completely stateless** and controlled by props.

---

## Events/Outputs

### No Direct Events
StatusBadge is a purely presentational component and doesn't emit events.

For interactive badges, wrap in a clickable element:
```typescript
<button onClick={handleClick}>
  <StatusBadge tone="warning">Pending Review</StatusBadge>
</button>
```

---

## Styling

### CSS Module
**File:** `StatusBadge.module.css`

### CSS Classes
- `.badge` - Base badge styles
- `.success` - Success tone styles (green)
- `.warning` - Warning tone styles (yellow/orange)
- `.danger` - Danger tone styles (red)
- `.info` - Info tone styles (blue)

### Typical Badge Styles
```css
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.success {
  background-color: #dcfce7;
  color: #166534;
}

.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.info {
  background-color: #dbeafe;
  color: #1e40af;
}
```

---

## Accessibility

### ARIA Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `"status"` | Identifies as a status indicator |
| `aria-label` | Custom or children text | Provides screen reader label |

### Implementation
```typescript
<span 
  role="status" 
  aria-label={ariaLabel || String(children)} 
  className={className}
>
  {children}
</span>
```

### Accessibility Features
✅ Semantic `role="status"` for live regions  
✅ Configurable ARIA label for context  
✅ Falls back to children content as label  
✅ Visual color combined with text for clarity

### Best Practices
- Always include descriptive text, not just icons
- Use `ariaLabel` for additional context when needed
- Avoid relying solely on color to convey meaning

---

## Usage Examples

### Basic Usage
```typescript
import { StatusBadge } from '@/components/common/StatusBadge';

function CourseStatus() {
  return (
    <div>
      <h3>Course: Safety Training 101</h3>
      <StatusBadge tone="success">Active</StatusBadge>
    </div>
  );
}
```

---

### All Tone Variants
```typescript
function StatusExamples() {
  return (
    <div>
      <StatusBadge tone="success">Completed</StatusBadge>
      <StatusBadge tone="warning">Pending</StatusBadge>
      <StatusBadge tone="danger">Cancelled</StatusBadge>
      <StatusBadge tone="info">In Progress</StatusBadge>
    </div>
  );
}
```

---

### With Custom ARIA Label
```typescript
<StatusBadge 
  tone="warning" 
  ariaLabel="Enrollment expires in 3 days"
>
  Expiring Soon
</StatusBadge>

// Screen reader announces: "Enrollment expires in 3 days"
// Visual displays: "Expiring Soon"
```

---

### In Data Table
```typescript
function EnrollmentTable() {
  const columns: Column<Enrollment>[] = [
    { id: 'user', header: 'User', accessor: (row) => row.userName },
    { id: 'course', header: 'Course', accessor: (row) => row.courseTitle },
    { 
      id: 'status', 
      header: 'Status', 
      accessor: (row) => (
        <StatusBadge tone={getStatusTone(row.status)}>
          {row.status}
        </StatusBadge>
      )
    }
  ];

  return <Table columns={columns} data={enrollments} />;
}

function getStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'Active': return 'info';
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Cancelled': return 'danger';
    default: return 'info';
  }
}
```

---

### Course Catalog with Status
```typescript
function CourseCard({ course }) {
  const statusTone = course.isActive ? 'success' : 'danger';
  const requiredTone = course.isRequired ? 'warning' : 'info';

  return (
    <Card title={course.title}>
      <p>{course.description}</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <StatusBadge tone={statusTone}>
          {course.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
        <StatusBadge tone={requiredTone}>
          {course.isRequired ? 'Required' : 'Optional'}
        </StatusBadge>
      </div>
    </Card>
  );
}
```

---

### User Status Display
```typescript
function UsersList() {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.fullName}
          <StatusBadge tone={user.isActive ? 'success' : 'danger'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </StatusBadge>
        </li>
      ))}
    </ul>
  );
}
```

---

### With Icons
```typescript
<StatusBadge tone="success">
  ✓ Approved
</StatusBadge>

<StatusBadge tone="danger">
  ✗ Rejected
</StatusBadge>

<StatusBadge tone="warning">
  ⏱ Pending
</StatusBadge>

<StatusBadge tone="info">
  ℹ In Review
</StatusBadge>
```

---

### Clickable Status Badge
```typescript
function InteractiveStatus({ status, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer' 
      }}
    >
      <StatusBadge tone="warning">
        {status} (Click to change)
      </StatusBadge>
    </button>
  );
}
```

---

### Dynamic Status Based on Dates
```typescript
function EnrollmentBadge({ enrollment }) {
  const getTone = (): BadgeTone => {
    if (enrollment.status === 'Completed') return 'success';
    if (enrollment.status === 'Cancelled') return 'danger';
    
    // Check expiration
    const daysUntilExpiry = getDaysUntil(enrollment.expiryDate);
    if (daysUntilExpiry < 7) return 'danger';
    if (daysUntilExpiry < 30) return 'warning';
    
    return 'info';
  };

  return (
    <StatusBadge tone={getTone()}>
      {enrollment.status}
    </StatusBadge>
  );
}
```

---

## Integration Points

### Used By
- Data tables (enrollment, course, user lists)
- Cards and list items
- Dashboard widgets
- Detail views
- Admin panels

### Dependencies
- **React** - Component framework
- **StatusBadge.module.css** - Component styles

### Common Parent Components
- `Table` - Status columns
- `Card` - Status indicators in cards
- `Layout` - Page-level status displays

---

## Testing

### Test File
[StatusBadge.test.tsx](../../src/components/common/__tests__/StatusBadge.test.tsx)

### Test Scenarios
1. Renders with all tone variants
2. Sets role="status"
3. Uses custom aria-label when provided
4. Falls back to children for aria-label
5. Applies correct CSS classes
6. Renders complex children

### Example Tests
```typescript
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders with success tone', () => {
    render(<StatusBadge tone="success">Active</StatusBadge>);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Active');
    expect(badge).toHaveClass('badge', 'success');
  });
  
  it('uses custom aria-label', () => {
    render(
      <StatusBadge tone="warning" ariaLabel="Custom label">
        Text
      </StatusBadge>
    );
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Custom label');
  });
  
  it('falls back to children for aria-label', () => {
    render(<StatusBadge tone="info">Info Text</StatusBadge>);
    
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Info Text');
  });
});
```

---

## Design Patterns

### Status Mapping Helper
```typescript
const STATUS_CONFIG: Record<string, { tone: BadgeTone; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  pending: { tone: 'warning', label: 'Pending' },
  cancelled: { tone: 'danger', label: 'Cancelled' },
  inProgress: { tone: 'info', label: 'In Progress' }
};

function DynamicStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <StatusBadge tone={config.tone}>{config.label}</StatusBadge>;
}
```

---

### Conditional Status Display
```typescript
function ConditionalStatus({ condition, trueState, falseState }) {
  const { tone, label } = condition ? trueState : falseState;
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

// Usage
<ConditionalStatus 
  condition={user.isActive}
  trueState={{ tone: 'success', label: 'Active' }}
  falseState={{ tone: 'danger', label: 'Inactive' }}
/>
```

---

### Multiple Badges
```typescript
function MultiBadgeDisplay({ item }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <StatusBadge tone="info">{item.category}</StatusBadge>
      <StatusBadge tone={item.isActive ? 'success' : 'danger'}>
        {item.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
      {item.isRequired && (
        <StatusBadge tone="warning">Required</StatusBadge>
      )}
    </div>
  );
}
```

---

## Styling Guidelines

### Spacing in Layouts
```typescript
// Horizontal layout
<div style={{ display: 'flex', gap: '0.5rem' }}>
  <StatusBadge tone="success">Active</StatusBadge>
  <StatusBadge tone="info">Public</StatusBadge>
</div>

// Vertical layout
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
  <StatusBadge tone="success">Completed</StatusBadge>
  <StatusBadge tone="info">Verified</StatusBadge>
</div>
```

---

### Size Variations (Future Enhancement)
```typescript
// Potential future API
<StatusBadge tone="success" size="small">Active</StatusBadge>
<StatusBadge tone="warning" size="large">Pending</StatusBadge>
```

---

## Browser Compatibility

### Supported Browsers
- All modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ with appropriate polyfills

### Required Features
- React 18+
- CSS Modules support
- ARIA support (all modern browsers)

---

## Performance Considerations

### Optimizations
- Lightweight component (no state, no effects)
- CSS Modules enable efficient styling
- No re-render optimization needed for simple usage

### When to Memoize
```typescript
// Not usually necessary
const badge = <StatusBadge tone="success">Active</StatusBadge>;

// But if used in large lists with expensive parents:
const MemoizedBadge = memo(StatusBadge);
```

---

## Common Patterns & Anti-Patterns

### ✅ Good Practices
```typescript
// Clear, descriptive text
<StatusBadge tone="success">Enrollment Complete</StatusBadge>

// Consistent tone usage
const tone = status === 'complete' ? 'success' : 'warning';
<StatusBadge tone={tone}>{status}</StatusBadge>
```

---

### ❌ Anti-Patterns
```typescript
// Avoid: Color only, no text
<StatusBadge tone="success"></StatusBadge>

// Avoid: Inconsistent tone usage
<StatusBadge tone="danger">Active</StatusBadge> // Danger tone for active?

// Avoid: Missing semantic meaning
<StatusBadge tone="info">#FF0000</StatusBadge> // Hex code as label
```

---

## Future Enhancements

### Potential Improvements
1. **Size variants:** small, medium, large
2. **Outline style:** Border-only badges
3. **Dismissible badges:** With close button
4. **Counter badges:** Numeric indicators
5. **Animated badges:** Pulse or blink for urgent items

### Example Future API
```typescript
<StatusBadge 
  tone="warning" 
  size="small"
  variant="outline"
  onDismiss={handleRemove}
  animate="pulse"
>
  Pending
</StatusBadge>
```

---

## Related Documentation
- [Table Component](./Table_doc.md) - Often uses badges in status columns
- [Card Component](./Card_doc.md) - Contains badges in headers/content
- [Button Component](./Button_doc.md) - Complementary interactive element

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
