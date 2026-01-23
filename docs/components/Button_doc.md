# Button Component Documentation

## Component Overview

**File:** `src/components/common/Button.tsx`  
**Type:** UI Component (Button)  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Reusable button component with support for multiple visual variants, loading states, and full accessibility features. Extends native HTML button functionality with application-specific styling.

### Key Features
- Three visual variants (primary, secondary, danger)
- Loading state with spinner
- Full accessibility support (ARIA attributes)
- Extends all native button HTML attributes
- CSS Module styling

---

## Props/Inputs

### ButtonProps Interface
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}
```

### Props Definition

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | No | `'primary'` | Visual style variant |
| `loading` | `boolean` | No | `false` | Shows loading spinner, disables button |
| `className` | `string` | No | `''` | Additional CSS classes |
| `children` | `React.ReactNode` | Yes | - | Button content/label |
| `disabled` | `boolean` | No | `false` | Disables button interaction |
| `...rest` | `ButtonHTMLAttributes` | No | - | All native button attributes |

### Type Definitions

#### ButtonVariant
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger';
```

**Variant Descriptions:**
- `primary` - Main action button (e.g., Save, Submit)
- `secondary` - Supporting actions (e.g., Cancel, Back)
- `danger` - Destructive actions (e.g., Delete, Remove)

---

## State

### Internal State
The component is **stateless** and controlled entirely by props.

### Derived State
- `classes` - Computed CSS classes based on variant and className
- `disabled` - Computed from `disabled` prop OR `loading` state

---

## Events/Outputs

### Supported Events
All standard button events are supported through spread props:

| Event | Type | Description |
|-------|------|-------------|
| `onClick` | `(e: React.MouseEvent) => void` | Click handler |
| `onFocus` | `(e: React.FocusEvent) => void` | Focus handler |
| `onBlur` | `(e: React.FocusEvent) => void` | Blur handler |
| `onKeyDown` | `(e: React.KeyboardEvent) => void` | Keyboard handler |

### Example Event Handlers
```typescript
<Button 
  onClick={(e) => console.log('Clicked!')}
  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
/>
```

---

## Styling

### CSS Module
**File:** `Button.module.css`

### CSS Classes
- `.btn` - Base button styles
- `.primary` - Primary variant styles
- `.secondary` - Secondary variant styles
- `.danger` - Danger variant styles
- `.loadingSpinner` - Loading spinner animation

### Custom Styling
Additional classes can be passed via the `className` prop:

```typescript
<Button className="custom-margin" variant="primary">
  Submit
</Button>
```

**Rendered Output:**
```html
<button class="btn primary custom-margin">...</button>
```

---

## Accessibility

### ARIA Attributes

| Attribute | Condition | Value | Purpose |
|-----------|-----------|-------|---------|
| `aria-busy` | When loading | `true` | Indicates loading state to screen readers |
| `disabled` | When disabled or loading | `true` | Prevents interaction |

### Keyboard Navigation
- **Enter/Space:** Activates button (native behavior)
- All standard button keyboard interactions supported

### Screen Reader Support
- Loading spinner has `aria-hidden="true"` to prevent announcement
- Button text remains visible during loading for screen reader access
- Proper semantic `<button>` element used

### Accessibility Best Practices
✅ Semantic HTML (`<button>`)  
✅ ARIA busy state for loading  
✅ Visual loading indicator hidden from screen readers  
✅ Disabled state prevents interaction  
✅ Focus management (native browser behavior)

---

## Usage Examples

### Basic Usage
```typescript
import { Button } from '@/components/common/Button';

function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked')}>
      Click Me
    </Button>
  );
}
```

---

### With Variants
```typescript
// Primary action
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// Secondary action
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Destructive action
<Button variant="danger" onClick={handleDelete}>
  Delete Item
</Button>
```

---

### Loading State
```typescript
function SaveButton() {
  const [loading, setLoading] = React.useState(false);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await saveData();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button loading={loading} onClick={handleSave}>
      {loading ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

---

### Disabled State
```typescript
<Button disabled onClick={handleSubmit}>
  Submit (Disabled)
</Button>

// Conditional disable
<Button disabled={!formValid} onClick={handleSubmit}>
  Submit
</Button>
```

---

### Form Submission
```typescript
function LoginForm() {
  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <Button type="submit" variant="primary">
        Login
      </Button>
    </form>
  );
}
```

---

### With Icons or Complex Content
```typescript
<Button variant="primary">
  <span>🗑️</span> Delete
</Button>

<Button variant="secondary">
  <Icon name="download" /> Download Report
</Button>
```

---

## Integration Points

### Used By
- All pages requiring action buttons
- Forms (submission, cancellation)
- Modal dialogs (confirm, cancel)
- Data tables (row actions)
- Admin panel (bulk operations)

### Dependencies
- **React** - Component framework
- **Button.module.css** - Component styles

---

## Testing

### Test File
[Button.test.tsx](../../src/components/common/__tests__/Button.test.tsx)

### Key Test Scenarios
1. Renders with different variants
2. Handles click events
3. Shows loading state correctly
4. Disables interaction when loading
5. Applies custom className
6. Supports all native button attributes
7. Sets ARIA attributes correctly

### Example Test
```typescript
it('should disable button when loading', () => {
  render(<Button loading>Save</Button>);
  const button = screen.getByRole('button');
  
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
```

---

## Design Decisions

### Why CSS Modules?
- **Scoped Styles:** Prevents class name collisions
- **Type Safety:** Works with TypeScript
- **Performance:** Only loads required CSS
- **Maintainability:** Co-located with component

### Why Extend Native Button Props?
Provides full HTML button functionality while adding custom features:
- Form integration (`type="submit"`)
- Accessibility attributes
- Event handlers
- Custom data attributes

### Loading State Implementation
- **Automatic disable:** Prevents double-submission
- **Visual feedback:** Spinner indicates processing
- **Accessibility:** ARIA busy state informs screen readers
- **Content preservation:** Button text remains for context

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- CSS Modules support (build-time)
- React 18+
- Modern CSS (flexbox, animations)

---

## Performance Considerations

### Optimizations
- Lightweight component (no heavy dependencies)
- CSS Modules enable tree-shaking
- Memoization not required (simple component)

### Rendering Performance
```typescript
// No need to memoize simple button usage
<Button onClick={handleClick}>Click</Button>

// But for expensive handlers, consider useCallback
const handleExpensiveClick = useCallback(() => {
  // expensive operation
}, [deps]);

<Button onClick={handleExpensiveClick}>Click</Button>
```

---

## Common Patterns

### Async Operations
```typescript
const [loading, setLoading] = useState(false);

const handleAsyncAction = async () => {
  setLoading(true);
  try {
    await apiCall();
    toast.success('Success!');
  } catch (error) {
    toast.error('Failed');
  } finally {
    setLoading(false);
  }
};

return <Button loading={loading} onClick={handleAsyncAction}>Save</Button>;
```

---

### Confirmation Dialog
```typescript
const handleDelete = () => {
  if (window.confirm('Are you sure?')) {
    deleteItem();
  }
};

return (
  <Button variant="danger" onClick={handleDelete}>
    Delete
  </Button>
);
```

---

## Future Enhancements

### Potential Improvements
1. **Size variants:** small, medium, large
2. **Icon positioning:** left, right, icon-only
3. **Button groups:** Connected button sets
4. **Tooltip support:** Built-in tooltip on hover
5. **Theme variants:** Support for light/dark mode

### Example Future API
```typescript
<Button 
  variant="primary" 
  size="large"
  icon={<SaveIcon />}
  iconPosition="left"
  tooltip="Save changes to server"
>
  Save
</Button>
```

---

## Related Documentation
- [StatusBadge Component](./StatusBadge_doc.md) - Status indicators
- [Table Component](./Table_doc.md) - Data tables using buttons
- [Card Component](./Card_doc.md) - Container for buttons

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
