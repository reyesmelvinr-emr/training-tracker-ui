# Card Component Documentation

## Component Overview

**File:** `src/components/common/Card.tsx`  
**Type:** UI Component (Container)  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Flexible container component providing consistent visual structure for content sections. Supports optional header, footer, and semantic HTML structure for better accessibility.

### Key Features
- Optional title header
- Optional footer section
- Semantic HTML (`<section>`)
- Accessible labeling
- CSS Module styling
- Flexible content area

---

## Props/Inputs

### CardProps Interface
```typescript
interface CardProps {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}
```

### Props Definition

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | No | - | Optional header title |
| `footer` | `React.ReactNode` | No | - | Optional footer content |
| `children` | `React.ReactNode` | Yes | - | Main card content |

---

## State

### Component State
The component is **completely stateless** and purely presentational.

---

## Events/Outputs

### No Direct Events
The Card component itself doesn't emit events. Event handlers should be attached to child components.

### Example with Child Events
```typescript
<Card title="User Actions">
  <Button onClick={handleEdit}>Edit</Button>
  <Button onClick={handleDelete}>Delete</Button>
</Card>
```

---

## Styling

### CSS Module
**File:** `Card.module.css`

### CSS Classes
- `.card` - Main card container
- `.header` - Header section (when title provided)
- `.footer` - Footer section (when footer provided)

### Layout Structure
```
┌─────────────────────────────┐
│ .header (optional)          │
├─────────────────────────────┤
│                             │
│ Main content (.card > div) │
│                             │
├─────────────────────────────┤
│ .footer (optional)          │
└─────────────────────────────┘
```

---

## Accessibility

### Semantic HTML
Uses `<section>` element with proper ARIA labeling:
```html
<section aria-label="User Profile">
  <!-- content -->
</section>
```

### ARIA Attributes

| Attribute | Condition | Purpose |
|-----------|-----------|---------|
| `aria-label` | When title provided | Labels section for screen readers |

### Accessibility Features
✅ Semantic `<section>` element  
✅ Optional ARIA label from title  
✅ Proper heading structure with `<header>`  
✅ Semantic `<footer>` for footer content

### Best Practices
- Use `title` prop to provide screen reader context
- Place interactive elements inside children
- Maintain logical heading hierarchy

---

## Usage Examples

### Basic Card
```typescript
import { Card } from '@/components/common/Card';

function UserProfile() {
  return (
    <Card>
      <h3>John Doe</h3>
      <p>Software Engineer</p>
      <p>john.doe@emerson.com</p>
    </Card>
  );
}
```

---

### Card with Title
```typescript
<Card title="User Profile">
  <div>
    <strong>Name:</strong> John Doe
  </div>
  <div>
    <strong>Email:</strong> john.doe@emerson.com
  </div>
</Card>
```

**Rendered Structure:**
```html
<section class="card" aria-label="User Profile">
  <header class="header">User Profile</header>
  <div>
    <!-- content -->
  </div>
</section>
```

---

### Card with Footer
```typescript
<Card 
  title="Course Details"
  footer={
    <>
      <Button variant="primary">Enroll</Button>
      <Button variant="secondary">Details</Button>
    </>
  }
>
  <h4>Safety Training 101</h4>
  <p>Duration: 4 hours</p>
  <p>Status: Active</p>
</Card>
```

---

### Stats Card
```typescript
function StatsCard() {
  return (
    <Card title="Total Users">
      <div style={{ fontSize: '3rem', textAlign: 'center' }}>
        1,234
      </div>
      <div style={{ textAlign: 'center', color: 'green' }}>
        ↑ 12% from last month
      </div>
    </Card>
  );
}
```

---

### Card Grid Layout
```typescript
function Dashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <Card title="Users">
        <p>Active: 1,234</p>
        <p>Inactive: 56</p>
      </Card>
      
      <Card title="Courses">
        <p>Total: 45</p>
        <p>Required: 12</p>
      </Card>
      
      <Card title="Enrollments">
        <p>Active: 3,456</p>
        <p>Completed: 2,890</p>
      </Card>
    </div>
  );
}
```

---

### Form Card
```typescript
<Card 
  title="Create New Course"
  footer={
    <>
      <Button type="submit" variant="primary">Create</Button>
      <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
    </>
  }
>
  <form onSubmit={handleSubmit}>
    <input name="title" placeholder="Course Title" />
    <textarea name="description" placeholder="Description" />
  </form>
</Card>
```

---

### Nested Cards
```typescript
<Card title="User Dashboard">
  <Card title="Recent Activity">
    <ul>
      <li>Completed Safety Training</li>
      <li>Enrolled in Advanced Course</li>
    </ul>
  </Card>
  
  <Card title="Upcoming Deadlines">
    <ul>
      <li>Complete Module 3 by Jan 30</li>
      <li>Quiz due Feb 5</li>
    </ul>
  </Card>
</Card>
```

---

## Integration Points

### Used By
- Dashboard page (stats cards)
- User profile displays
- Course information sections
- Admin panel widgets
- Form containers
- Data visualization wrappers

### Dependencies
- **React** - Component framework
- **Card.module.css** - Component styles

### Common Child Components
- Forms
- Buttons
- Tables
- Charts/graphs
- Lists
- Text content

---

## Design Patterns

### Dashboard Cards
```typescript
const dashboardCards = [
  { title: 'Total Users', value: stats.totalUsers },
  { title: 'Active Courses', value: stats.activeCourses },
  { title: 'Completion Rate', value: `${stats.completionRate}%` }
];

return (
  <div className="dashboard-grid">
    {dashboardCards.map(card => (
      <Card key={card.title} title={card.title}>
        <div className="stat-value">{card.value}</div>
      </Card>
    ))}
  </div>
);
```

---

### Action Card Pattern
```typescript
function ActionCard({ title, description, onAction, actionLabel }) {
  return (
    <Card 
      title={title}
      footer={<Button onClick={onAction}>{actionLabel}</Button>}
    >
      <p>{description}</p>
    </Card>
  );
}

// Usage
<ActionCard 
  title="Pending Approval"
  description="5 enrollments need review"
  onAction={handleReview}
  actionLabel="Review Now"
/>
```

---

### Loading Card
```typescript
function LoadingCard({ title }) {
  return (
    <Card title={title}>
      <div className="skeleton-loader">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </Card>
  );
}
```

---

### Empty State Card
```typescript
function EmptyCard({ title, message, action }) {
  return (
    <Card 
      title={title}
      footer={action}
    >
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>{message}</p>
      </div>
    </Card>
  );
}

// Usage
<EmptyCard 
  title="Courses"
  message="No courses available"
  action={<Button onClick={handleCreate}>Create First Course</Button>}
/>
```

---

## Styling Guidelines

### Recommended CSS Module Styles
```css
/* Card.module.css */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0;
  overflow: hidden;
}

.header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 1.125rem;
}

.card > div {
  padding: 1.5rem;
}

.footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
```

---

## Common Customizations

### Card with Custom Styling
```typescript
<Card title="Custom Card">
  <div style={{ 
    backgroundColor: '#f0f9ff',
    padding: '2rem',
    borderRadius: '4px'
  }}>
    Custom styled content
  </div>
</Card>
```

---

### Compact Card
```typescript
<Card>
  <div style={{ padding: '0.5rem' }}>
    Minimal padding content
  </div>
</Card>
```

---

### Full-Width Footer
```typescript
<Card 
  title="Actions"
  footer={
    <Button style={{ width: '100%' }} variant="primary">
      Full Width Action
    </Button>
  }
>
  Content here
</Card>
```

---

## Testing

### Test Scenarios
1. Renders with children only
2. Renders with title
3. Renders with footer
4. Sets aria-label when title provided
5. Renders complex footer content
6. Handles nested components

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with title and aria-label', () => {
    render(
      <Card title="Test Card">
        <p>Content</p>
      </Card>
    );
    
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-label', 'Test Card');
  });
  
  it('renders footer when provided', () => {
    render(
      <Card footer={<button>Action</button>}>
        Content
      </Card>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

---

## Performance Considerations

### Optimizations
- Lightweight component (no state)
- No re-render optimization needed (pure presentational)
- CSS Modules enable efficient styling

### When to Memoize
```typescript
// Generally not needed for Card itself
// But if passing expensive children:
const expensiveContent = useMemo(() => (
  <ComplexChart data={largeDataset} />
), [largeDataset]);

<Card title="Chart">
  {expensiveContent}
</Card>
```

---

## Browser Compatibility

### Supported Browsers
- All modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with appropriate polyfills)

### Required Features
- React 18+
- CSS Modules support
- Semantic HTML5 elements

---

## Future Enhancements

### Potential Improvements
1. **Collapsible cards:** Expand/collapse functionality
2. **Loading state:** Built-in skeleton loader
3. **Variants:** Different visual styles (bordered, elevated, flat)
4. **Actions menu:** Header actions (edit, delete, etc.)
5. **Drag-and-drop:** Reorderable cards

### Example Future API
```typescript
<Card 
  title="Advanced Card"
  variant="elevated"
  collapsible
  defaultCollapsed={false}
  actions={
    <IconButton icon="more" onClick={handleMenu} />
  }
>
  Content
</Card>
```

---

## Related Documentation
- [Button Component](./Button_doc.md) - Often used in card footers
- [Table Component](./Table_doc.md) - Often wrapped in cards
- [Layout Component](./Layout_doc.md) - Page-level container

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
