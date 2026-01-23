# NotFound Page Documentation

## Overview

**File:** `src/pages/NotFound.tsx`  
**Type:** React Page Component  
**Route:** `*` (fallback)  
**Team:** Frontend Team  
**Last Updated:** January 24, 2026

### Purpose
404 error page displayed when users navigate to non-existent routes. Provides minimal feedback with consistent layout.

### Key Features
- Fallback route for unmatched URLs
- Consistent layout wrapper
- Simple error message

---

## Component Signature

```typescript
function NotFound(): JSX.Element
```

### No Props
Page-level component rendered by React Router fallback route.

---

## Usage Example

```typescript
// In App.tsx
<Route path="*" element={<NotFound />} />
```

---

## UI Structure

```
Layout
└── <h1>404 - Not Found</h1>
```

---

## Enhancement Ideas

### Add Navigation
```typescript
export function NotFound() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>404 - Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </Layout>
  );
}
```

### Add Illustration
```typescript
export function NotFound() {
  return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
        <h1>404 - Page Not Found</h1>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          We couldn't find the page you're looking for.
        </p>
      </div>
    </Layout>
  );
}
```

---

## Related Documentation
- [App Component](./App_doc.md) - Route definitions
- [Layout Component](../components/Layout_doc.md) - Page wrapper

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
