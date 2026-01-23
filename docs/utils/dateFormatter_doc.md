# dateFormatter Utility Documentation

## Utility Overview

**File:** `src/utils/dateFormatter.ts`  
**Type:** Utility Function (Date Formatting)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
Provides a centralized, reusable date formatting utility leveraging the industry-standard `date-fns` library. Handles multiple input types (string, Date object, null, undefined) and supports flexible date-fns format patterns for consistent date display across the application.

### Key Features
- Flexible input type handling (string, Date, null, undefined)
- Configurable format patterns via `date-fns`
- Safe null/undefined handling (returns empty string)
- Single, optimized formatting function
- Type-safe implementation with TypeScript
- No date parsing issues with ISO strings

---

## Function Signature

### formatDate()

```typescript
export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'MMM d, yyyy'
): string
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `date` | `string \| Date \| null \| undefined` | Yes | - | Date to format (ISO string, Date object, or null) |
| `pattern` | `string` | No | `'MMM d, yyyy'` | Format pattern from date-fns (e.g., 'yyyy-MM-dd', 'MMM d, yyyy') |

### Return Value

| Return | Type | Description |
|--------|------|-------------|
| Formatted string or empty string | `string` | Formatted date or `''` if input is null/undefined |

### Implementation

```typescript
import { format } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, pattern = 'MMM d, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}
```

---

## Supported Format Patterns

### Common Patterns Reference

| Pattern | Example Output | Use Case |
|---------|-----------------|----------|
| `'MMM d, yyyy'` | `'Jan 24, 2026'` | Standard US format (DEFAULT) |
| `'yyyy-MM-dd'` | `'2026-01-24'` | ISO-like format |
| `'MM/dd/yyyy'` | `'01/24/2026'` | US short format |
| `'dd/MM/yyyy'` | `'24/01/2026'` | International format |
| `'MMMM d, yyyy'` | `'January 24, 2026'` | Full month name |
| `'MMM d'` | `'Jan 24'` | Month and day only |
| `'yyyy'` | `'2026'` | Year only |
| `'EEEE, MMMM d, yyyy'` | `'Thursday, January 24, 2026'` | Full date with day name |
| `'h:mm a'` | `'3:30 PM'` | Time only |
| `'MMM d, yyyy h:mm a'` | `'Jan 24, 2026 3:30 PM'` | Date and time |
| `'HH:mm:ss'` | `'15:30:45'` | 24-hour time |

### Pattern Documentation
For complete format patterns, refer to [date-fns format documentation](https://date-fns.org/docs/format)

---

## Usage Examples

### Example 1: Default Format (Most Common)
```typescript
import { formatDate } from '@/utils/dateFormatter';

// Using ISO string from API
const apiDate = '2026-01-24T10:30:00Z';
const formatted = formatDate(apiDate);
console.log(formatted); // Output: 'Jan 24, 2026'

// Using Date object
const today = new Date();
const formatted = formatDate(today);
console.log(formatted); // Output: 'Jan 24, 2026' (today's date)
```

---

### Example 2: Custom Format Pattern - ISO Date
```typescript
// Display in ISO format for API submissions
const date = new Date('2026-01-24');
const isoFormat = formatDate(date, 'yyyy-MM-dd');
console.log(isoFormat); // Output: '2026-01-24'

// For database storage
const dbFormat = formatDate(date, 'yyyy-MM-dd HH:mm:ss');
console.log(dbFormat); // Output: '2026-01-24 00:00:00'
```

---

### Example 3: Short Format for Table Display
```typescript
// Compact display for data tables
const courseDate = new Date('2026-01-24');
const shortFormat = formatDate(courseDate, 'MMM d');
console.log(shortFormat); // Output: 'Jan 24'

// Even shorter - month only
const monthOnly = formatDate(courseDate, 'MMM');
console.log(monthOnly); // Output: 'Jan'
```

---

### Example 4: Full Format with Day of Week
```typescript
// For display in headers or important sections
const date = new Date('2026-01-24');
const fullFormat = formatDate(date, 'EEEE, MMMM d, yyyy');
console.log(fullFormat); // Output: 'Thursday, January 24, 2026'

// Without year
const dayMonthFormat = formatDate(date, 'EEEE, MMMM d');
console.log(dayMonthFormat); // Output: 'Thursday, January 24'
```

---

### Example 5: Null/Undefined Handling
```typescript
// API might return null for optional dates
const completionDate = null;
const formatted = formatDate(completionDate);
console.log(formatted); // Output: '' (empty string)

// Check before rendering
const displayDate = formatDate(completionDate) || 'Not completed';
console.log(displayDate); // Output: 'Not completed'

// Undefined handling
const noDate = undefined;
const result = formatDate(noDate);
console.log(result); // Output: '' (empty string)
```

---

### Example 6: Integration with Table Displays
```typescript
import { formatDate } from '@/utils/dateFormatter';

interface TableRow {
  id: string;
  name: string;
  enrollmentDate: string; // ISO format from API
  completionDate?: string;
}

function CoursesTable({ courses }: { courses: TableRow[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Course Name</th>
          <th>Enrollment Date</th>
          <th>Completion Date</th>
        </tr>
      </thead>
      <tbody>
        {courses.map(course => (
          <tr key={course.id}>
            <td>{course.name}</td>
            <td>{formatDate(course.enrollmentDate)}</td>
            <td>
              {formatDate(course.completionDate) || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Example 7: Date Range Formatting
```typescript
// Display a date range for a course
interface Course {
  title: string;
  startDate: Date;
  endDate: Date;
}

function CourseInfo({ course }: { course: Course }) {
  const start = formatDate(course.startDate, 'MMM d');
  const end = formatDate(course.endDate, 'MMM d, yyyy');
  
  return (
    <div>
      <h2>{course.title}</h2>
      <p>Duration: {start} - {end}</p>
    </div>
  );
}
```

---

### Example 8: Conditional Formatting Based on Context
```typescript
// Different formats based on context
function formatDateForContext(date: string | Date, context: 'table' | 'detail' | 'export') {
  switch (context) {
    case 'table':
      return formatDate(date, 'MMM d'); // Compact for tables
    case 'detail':
      return formatDate(date, 'EEEE, MMMM d, yyyy'); // Full for detail views
    case 'export':
      return formatDate(date, 'yyyy-MM-dd'); // ISO for exports
  }
}

// Usage
const courseDate = new Date('2026-01-24');
console.log(formatDateForContext(courseDate, 'table')); // 'Jan 24'
console.log(formatDateForContext(courseDate, 'detail')); // 'Thursday, January 24, 2026'
console.log(formatDateForContext(courseDate, 'export')); // '2026-01-24'
```

---

### Example 9: Relative Time Display with Fallback
```typescript
import { formatDate } from '@/utils/dateFormatter';
import { differenceInDays } from 'date-fns';

// Show relative time or formatted date
function smartDateDisplay(date: Date) {
  const daysAgo = differenceInDays(new Date(), date);
  
  if (daysAgo === 0) {
    return 'Today';
  } else if (daysAgo === 1) {
    return 'Yesterday';
  } else if (daysAgo < 7) {
    return `${daysAgo} days ago`;
  } else {
    return formatDate(date, 'MMM d, yyyy');
  }
}
```

---

### Example 10: React Component with Formatted Date
```typescript
import { formatDate } from '@/utils/dateFormatter';
import React from 'react';

interface EnrollmentCardProps {
  courseName: string;
  enrollmentDate: string; // ISO string from API
  dueDate?: string;
}

function EnrollmentCard({ courseName, enrollmentDate, dueDate }: EnrollmentCardProps) {
  return (
    <div className="card">
      <h3>{courseName}</h3>
      <p>
        <strong>Enrolled:</strong> {formatDate(enrollmentDate)}
      </p>
      {dueDate && (
        <p>
          <strong>Due:</strong> {formatDate(dueDate, 'MMM d, yyyy h:mm a')}
        </p>
      )}
    </div>
  );
}

export default EnrollmentCard;
```

---

### Example 11: Form Input with Formatted Date
```typescript
import { formatDate } from '@/utils/dateFormatter';
import React from 'react';

interface CourseFormProps {
  course?: {
    title: string;
    startDate: Date;
    endDate: Date;
  };
  onSubmit: (data: any) => void;
}

function CourseForm({ course, onSubmit }: CourseFormProps) {
  const [startDate, setStartDate] = React.useState(
    course ? formatDate(course.startDate, 'yyyy-MM-dd') : ''
  );
  const [endDate, setEndDate] = React.useState(
    course ? formatDate(course.endDate, 'yyyy-MM-dd') : ''
  );
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ startDate, endDate });
    }}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### Example 12: Email Template with Formatted Dates
```typescript
// For email notifications
import { formatDate } from '@/utils/dateFormatter';

function generateEnrollmentEmail(
  userName: string,
  courseTitle: string,
  startDate: Date,
  endDate: Date
) {
  return `
Dear ${userName},

You have been enrolled in: ${courseTitle}

Start Date: ${formatDate(startDate, 'MMMM d, yyyy')}
End Date: ${formatDate(endDate, 'MMMM d, yyyy')}

Best regards,
Training Team
  `.trim();
}
```

---

## Integration with Table Displays

### Example: EnrollmentsTable
```typescript
import { formatDate } from '@/utils/dateFormatter';

function EnrollmentsTable({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Course</th>
          <th>Status</th>
          <th>Enrolled</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        {enrollments.map(e => (
          <tr key={e.id}>
            <td>{e.courseName}</td>
            <td>{e.status}</td>
            <td>{formatDate(e.enrollmentDate)}</td>
            <td>{formatDate(e.completionDate) || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Localization Considerations

### Current Limitations
The current implementation uses default English locale from date-fns. For international applications:

```typescript
// Option 1: Use locale parameter (requires advanced setup)
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

function formatDateWithLocale(date: Date, pattern: string, locale: Locale) {
  return format(date, pattern, { locale });
}

// Option 2: Use user's browser locale
function formatDateUserLocale(date: Date, pattern: string) {
  return new Intl.DateTimeFormat(navigator.language).format(date);
}
```

### Future Enhancement
Support for locale parameter could be added to `formatDate`:

```typescript
// Proposed enhancement
export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'MMM d, yyyy',
  locale?: Locale
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, locale ? { locale } : {});
}
```

---

## Edge Cases and Error Handling

### Invalid Date String
```typescript
// Invalid ISO string
const invalid = 'not-a-date';
const d = new Date(invalid);
const result = formatDate(d, 'MMM d, yyyy');
// Result: 'Invalid Date' (from date-fns)

// Handle with error boundary
function safeFormat(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDate(date);
  } catch (e) {
    return 'Error parsing date';
  }
}
```

---

### Timezone Considerations
```typescript
// API returns UTC, browser displays local time
const apiDate = '2026-01-24T15:30:00Z'; // UTC
const formatted = formatDate(apiDate); // Converts to local time
console.log(formatted); // Respects user's timezone

// For consistent display across timezones
function formatDateUTC(dateString: string, pattern = 'MMM d, yyyy') {
  const utcDate = new Date(dateString);
  return formatDate(utcDate, pattern);
}
```

---

## Performance Considerations

### Memory Efficiency
```typescript
// Efficient: Single function call
const formatted = formatDate(date);

// Less efficient: Creating intermediate Date objects
const d = new Date(dateString);
const formatted = format(d, pattern);
```

### Optimization Recommendations
1. Memoize formatted dates in components if displayed repeatedly:

```typescript
const memoizedFormat = React.useMemo(
  () => formatDate(date, 'MMM d, yyyy'),
  [date]
);
```

2. Use formatDate in list items cautiously:

```typescript
// Good: Format once per item
{items.map(item => (
  <span key={item.id}>{formatDate(item.date)}</span>
))}

// Avoid: Multiple format calls per item
{items.map(item => (
  <span key={item.id}>
    {formatDate(item.date)} - {formatDate(item.date, 'HH:mm')}
    {/* Format once and reuse */}
  </span>
))}
```

---

## Testing

### Unit Test Examples

#### Test 1: Default Format
```typescript
import { formatDate } from '@/utils/dateFormatter';

describe('formatDate', () => {
  it('should format date with default pattern', () => {
    const date = new Date('2026-01-24');
    const result = formatDate(date);
    expect(result).toBe('Jan 24, 2026');
  });
});
```

---

#### Test 2: Custom Pattern
```typescript
it('should format date with custom pattern', () => {
  const date = new Date('2026-01-24');
  const result = formatDate(date, 'yyyy-MM-dd');
  expect(result).toBe('2026-01-24');
});
```

---

#### Test 3: ISO String Input
```typescript
it('should handle ISO string input', () => {
  const isoString = '2026-01-24T10:30:00Z';
  const result = formatDate(isoString);
  expect(result).toBe('Jan 24, 2026');
});
```

---

#### Test 4: Null/Undefined Handling
```typescript
it('should return empty string for null', () => {
  expect(formatDate(null)).toBe('');
});

it('should return empty string for undefined', () => {
  expect(formatDate(undefined)).toBe('');
});
```

---

## Related Documentation

- [validators.ts Documentation](validators_doc.md) - Related utility functions
- [useCourses Hook Documentation](../hooks/) - Uses formatDate for date display
- [CoursesPage Documentation](../pages/) - Component integration example

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `date-fns` | latest | Date formatting library |
| TypeScript | latest | Type safety |

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting Null Check
```typescript
// DON'T DO THIS
const date = apiResponse.completionDate; // Might be null
const formatted = formatDate(date); // Safe, but check the result
return <p>{formatted}</p>; // Empty paragraph if null
```

### ✅ Solution
```typescript
// DO THIS
const date = apiResponse.completionDate;
const formatted = formatDate(date);
return <p>{formatted || 'Not completed'}</p>;
```

---

### ❌ Pitfall 2: Wrong Pattern Syntax
```typescript
// DON'T DO THIS - Invalid pattern
formatDate(date, 'YYYY-MM-DD'); // 'YYYY' is wrong in date-fns
```

### ✅ Solution
```typescript
// DO THIS - Correct date-fns pattern
formatDate(date, 'yyyy-MM-dd'); // Use lowercase 'yyyy'
```

---

## Future Enhancements

1. Locale support with i18n integration
2. Relative time formatting (e.g., "2 days ago")
3. Range formatting utility
4. Caching for performance
5. Custom date validation

---

## Metadata

| Property | Value |
|----------|-------|
| **File Size** | ~10 lines |
| **Complexity** | Low |
| **External Dependencies** | date-fns |
| **Last Reviewed** | January 24, 2026 |
| **Status** | Active - Production Ready |

---

*Documentation generated for AKR documentation system. See related files for complete utility documentation.*
