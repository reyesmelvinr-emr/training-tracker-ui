# Table Component Documentation

## Component Overview

**File:** `src/components/common/Table.tsx`  
**Type:** UI Component (Data Table)  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Generic, reusable data table component with TypeScript generics support for type-safe rendering of tabular data. Provides flexible column configuration with custom accessor functions for complex data transformations.

### Key Features
- TypeScript generic support for type safety
- Flexible column configuration
- Custom cell rendering via accessor functions
- Empty state handling
- Optional table caption
- Semantic HTML table structure
- CSS Module styling

---

## Props/Inputs

### TableProps Interface
```typescript
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  caption?: string;
}
```

### Column Interface
```typescript
interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
}
```

### Props Definition

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `Column<T>[]` | Yes | - | Column definitions |
| `data` | `T[]` | Yes | - | Array of data objects |
| `emptyMessage` | `string` | No | `'No data'` | Message when data is empty |
| `caption` | `string` | No | - | Table caption for accessibility |

### Column Definition

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique column identifier (used as key) |
| `header` | `string` | Column header text |
| `accessor` | `(row: T) => React.ReactNode` | Function to extract/render cell value |

---

## State

### Component State
The component is **completely stateless**. All data and configuration come from props.

---

## Events/Outputs

### No Direct Events
The Table component itself doesn't emit events. Interactive elements should be rendered in cells via accessor functions.

### Event Handling in Cells
```typescript
const columns: Column<User>[] = [
  {
    id: 'actions',
    header: 'Actions',
    accessor: (row) => (
      <Button onClick={() => handleEdit(row.id)}>Edit</Button>
    )
  }
];
```

---

## Styling

### CSS Module
**File:** `Table.module.css`

### CSS Classes
- `.tableWrapper` - Scrollable table container
- `.empty` - Empty state cell styling

### HTML Structure
```html
<div class="tableWrapper">
  <table>
    <caption>Table Caption</caption>
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Accessibility

### Semantic HTML
✅ Proper `<table>` structure  
✅ `<thead>` and `<tbody>` sections  
✅ Optional `<caption>` for context  
✅ Semantic `<th>` headers

### Screen Reader Support
- Table caption announces table purpose
- Header cells properly associated with data cells
- Empty state clearly communicated

### Best Practices
```typescript
// Add caption for context
<Table 
  caption="User enrollment statistics for Q1 2026"
  columns={columns}
  data={data}
/>
```

---

## Usage Examples

### Basic Table
```typescript
import { Table, Column } from '@/components/common/Table';

interface User {
  id: string;
  name: string;
  email: string;
}

function UsersList() {
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@emerson.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@emerson.com' }
  ];

  const columns: Column<User>[] = [
    { id: 'name', header: 'Name', accessor: (row) => row.name },
    { id: 'email', header: 'Email', accessor: (row) => row.email }
  ];

  return <Table columns={columns} data={users} />;
}
```

---

### With Custom Cell Rendering
```typescript
interface Course {
  id: string;
  title: string;
  isActive: boolean;
  isRequired: boolean;
}

const columns: Column<Course>[] = [
  {
    id: 'title',
    header: 'Course Title',
    accessor: (row) => row.title
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => (
      <StatusBadge tone={row.isActive ? 'success' : 'danger'}>
        {row.isActive ? 'Active' : 'Inactive'}
      </StatusBadge>
    )
  },
  {
    id: 'required',
    header: 'Required',
    accessor: (row) => row.isRequired ? 'Yes' : 'No'
  }
];

return <Table columns={columns} data={courses} />;
```

---

### With Action Buttons
```typescript
const columns: Column<User>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name },
  { id: 'email', header: 'Email', accessor: (row) => row.email },
  {
    id: 'actions',
    header: 'Actions',
    accessor: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button 
          variant="secondary" 
          onClick={() => handleEdit(row.id)}
        >
          Edit
        </Button>
        <Button 
          variant="danger" 
          onClick={() => handleDelete(row.id)}
        >
          Delete
        </Button>
      </div>
    )
  }
];
```

---

### With Formatted Data
```typescript
import { formatDate } from '@/utils/dateFormatter';

interface Enrollment {
  id: string;
  userName: string;
  courseName: string;
  enrolledDate: string;
  completionRate: number;
}

const columns: Column<Enrollment>[] = [
  { 
    id: 'user', 
    header: 'User', 
    accessor: (row) => row.userName 
  },
  { 
    id: 'course', 
    header: 'Course', 
    accessor: (row) => row.courseName 
  },
  { 
    id: 'date', 
    header: 'Enrolled', 
    accessor: (row) => formatDate(row.enrolledDate) 
  },
  { 
    id: 'progress', 
    header: 'Progress', 
    accessor: (row) => `${row.completionRate}%` 
  }
];
```

---

### With Empty State
```typescript
<Table 
  columns={columns} 
  data={[]} 
  emptyMessage="No courses found. Create your first course to get started."
/>
```

**Rendered Output:**
```html
<table>
  <tbody>
    <tr>
      <td class="empty" colspan="3">
        No courses found. Create your first course to get started.
      </td>
    </tr>
  </tbody>
</table>
```

---

### With Caption
```typescript
<Table 
  caption="Active user enrollments for Safety Training"
  columns={columns}
  data={enrollments}
/>
```

---

### With Links
```typescript
const columns: Column<Course>[] = [
  {
    id: 'title',
    header: 'Course Title',
    accessor: (row) => (
      <a href={`/courses/${row.id}`}>{row.title}</a>
    )
  },
  {
    id: 'category',
    header: 'Category',
    accessor: (row) => row.category
  }
];
```

---

### Complex Accessor Logic
```typescript
const columns: Column<Enrollment>[] = [
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => {
      if (row.completedDate) {
        return <StatusBadge tone="success">Completed</StatusBadge>;
      }
      if (row.cancelledDate) {
        return <StatusBadge tone="danger">Cancelled</StatusBadge>;
      }
      if (isExpired(row.expiryDate)) {
        return <StatusBadge tone="danger">Expired</StatusBadge>;
      }
      return <StatusBadge tone="info">Active</StatusBadge>;
    }
  }
];
```

---

## Integration Points

### Used By
- Dashboard page (statistics tables)
- Course catalog (course listings)
- User management (user lists)
- Enrollment tracking (enrollment lists)
- Admin panel (various data displays)

### Dependencies
- **React** - Component framework
- **Table.module.css** - Component styles

### Common Child Components
- `Button` - Action buttons in cells
- `StatusBadge` - Status indicators
- Links and formatted text

---

## TypeScript Generics

### Type Safety Benefits
```typescript
interface Course {
  id: string;
  title: string;
  duration: number;
}

// TypeScript ensures accessor functions receive Course objects
const columns: Column<Course>[] = [
  {
    id: 'title',
    header: 'Title',
    accessor: (row) => row.title // row is typed as Course
  },
  {
    id: 'duration',
    header: 'Duration',
    accessor: (row) => `${row.duration} hours` // Autocomplete works!
  }
];

// TypeScript ensures data matches Course type
const courses: Course[] = [...];
return <Table<Course> columns={columns} data={courses} />;
```

---

### Generic Function Component
```typescript
export function Table<T>({ 
  columns, 
  data, 
  emptyMessage = 'No data', 
  caption 
}: TableProps<T>) {
  // Component implementation
}
```

---

## Testing

### Test File
[Table.test.tsx](../../src/components/common/__tests__/Table.test.tsx)

### Test Scenarios
1. Renders table with headers
2. Renders data rows
3. Shows empty message when no data
4. Applies custom empty message
5. Renders caption when provided
6. Calls accessor functions correctly
7. Renders complex cell content

### Example Tests
```typescript
import { render, screen } from '@testing-library/react';
import { Table, Column } from './Table';

interface TestData {
  id: string;
  name: string;
}

describe('Table', () => {
  const columns: Column<TestData>[] = [
    { id: 'id', header: 'ID', accessor: (row) => row.id },
    { id: 'name', header: 'Name', accessor: (row) => row.name }
  ];

  it('renders table headers', () => {
    render(<Table columns={columns} data={[]} />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    const data: TestData[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' }
    ];

    render(<Table columns={columns} data={data} />);
    
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(
      <Table 
        columns={columns} 
        data={[]} 
        emptyMessage="Custom empty message"
      />
    );
    
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });
});
```

---

## Design Patterns

### Sortable Table (Future Enhancement)
```typescript
const [sortConfig, setSortConfig] = useState({ 
  column: null, 
  direction: 'asc' 
});

const sortedData = useMemo(() => {
  if (!sortConfig.column) return data;
  
  return [...data].sort((a, b) => {
    // Sorting logic
  });
}, [data, sortConfig]);

return <Table columns={columns} data={sortedData} />;
```

---

### Paginated Table
```typescript
function PaginatedTable<T>({ 
  columns, 
  data, 
  pageSize = 10 
}: TableProps<T> & { pageSize?: number }) {
  const [page, setPage] = useState(0);
  
  const paginatedData = data.slice(
    page * pageSize, 
    (page + 1) * pageSize
  );
  
  return (
    <>
      <Table columns={columns} data={paginatedData} />
      <div>
        <Button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
          Previous
        </Button>
        <span>Page {page + 1}</span>
        <Button 
          onClick={() => setPage(p => p + 1)} 
          disabled={(page + 1) * pageSize >= data.length}
        >
          Next
        </Button>
      </div>
    </>
  );
}
```

---

### Selectable Rows
```typescript
function SelectableTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  const columns: Column<User>[] = [
    {
      id: 'select',
      header: '☑',
      accessor: (row) => (
        <input 
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={(e) => {
            const newSelected = new Set(selected);
            if (e.target.checked) {
              newSelected.add(row.id);
            } else {
              newSelected.delete(row.id);
            }
            setSelected(newSelected);
          }}
        />
      )
    },
    // ... other columns
  ];
  
  return <Table columns={columns} data={data} />;
}
```

---

## Performance Considerations

### Large Datasets
For tables with 100+ rows, consider:
- Pagination
- Virtual scrolling
- Row memoization

```typescript
// Memoize expensive accessor functions
const columns: Column<Data>[] = useMemo(() => [
  {
    id: 'expensive',
    header: 'Calculated',
    accessor: (row) => expensiveCalculation(row)
  }
], []);
```

---

### Virtualization Example
```typescript
import { useVirtual } from 'react-virtual';

function VirtualTable({ columns, data }) {
  const parentRef = useRef();
  
  const rowVirtualizer = useVirtual({
    size: data.length,
    parentRef,
    estimateSize: useCallback(() => 50, []),
  });
  
  // Render only visible rows
}
```

---

## Styling Customization

### Responsive Table
```css
/* Table.module.css */
.tableWrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 600px; /* Prevent table from being too narrow */
}

@media (max-width: 768px) {
  table {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
}
```

---

### Striped Rows
```css
tbody tr:nth-child(even) {
  background-color: #f9fafb;
}
```

---

### Hover Effects
```css
tbody tr:hover {
  background-color: #f3f4f6;
  cursor: pointer;
}
```

---

## Browser Compatibility

### Supported Browsers
- All modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ with polyfills

### Required Features
- React 18+
- TypeScript 4.5+
- CSS Modules support

---

## Common Issues & Solutions

### Issue: Row keys warning
**Problem:** Each row needs a unique key

**Solution:** Use array index as fallback
```typescript
{data.map((row, idx) => (
  <tr key={row.id || idx}>
    {/* cells */}
  </tr>
))}
```

---

### Issue: Overflow with long content
**Solution:** Add text truncation
```typescript
accessor: (row) => (
  <div style={{ 
    maxWidth: '200px', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }}>
    {row.longText}
  </div>
)
```

---

## Future Enhancements

### Potential Improvements
1. **Sorting:** Click headers to sort
2. **Filtering:** Column-level filters
3. **Row selection:** Checkbox selection
4. **Column resizing:** Draggable column widths
5. **Export:** CSV/Excel export
6. **Sticky headers:** Fixed header on scroll
7. **Row expansion:** Expandable detail rows

### Example Future API
```typescript
<Table 
  columns={columns}
  data={data}
  sortable
  filterable
  selectable
  onSelectionChange={handleSelection}
  stickyHeader
  exportable
/>
```

---

## Related Documentation
- [Button Component](./Button_doc.md) - Action buttons in cells
- [StatusBadge Component](./StatusBadge_doc.md) - Status indicators
- [Card Component](./Card_doc.md) - Table container

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
