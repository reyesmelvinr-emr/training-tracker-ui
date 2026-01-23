# API Service Documentation

## Overview

**File:** `src/services/api.ts`  
**Type:** HTTP Client Service  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Alternative HTTP client configuration providing mock data support and authentication token management. Designed for development flexibility with mock/live API toggling.

### Key Responsibilities
- Configure Axios instance with base URL
- Manage authentication tokens
- Handle request/response interceptors
- Provide mock data toggle for development

---

## Service Configuration

### Base URL
```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL as string;
```

**Environment Variable:** `VITE_API_BASE_URL` (required)

### Mock Mode
```typescript
const useMocks = import.meta.env.VITE_USE_API_MOCKS === 'true';
```

**Environment Variable:** `VITE_USE_API_MOCKS`  
**Values:** `'true'` | `'false'`  
**Default:** `'false'`

---

## Request Interceptors

### Authentication Interceptor
Automatically attaches JWT token from localStorage to all requests.

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Token Storage:** `localStorage.getItem('token')`  
**Header:** `Authorization: Bearer <token>`

---

## Response Interceptors

### Error Logging Interceptor
Logs API errors to console during development.

```typescript
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error', error);
    }
    return Promise.reject(error);
  }
);
```

**Behavior:**
- Passes through successful responses unchanged
- Logs errors only in development mode (`import.meta.env.DEV`)
- Re-throws error for upstream handling

---

## Mock Data Helper

### `maybeMock<T>(mockData, fn)`
Toggle between mock data and live API calls.

**Type Signature:**
```typescript
function maybeMock<T>(mockData: T, fn: () => Promise<T>): Promise<T>
```

**Parameters:**
- `mockData` (T): Mock data to return when in mock mode
- `fn` (function): Async function that calls the real API

**Returns:** Promise<T>

**Behavior:**
- If `VITE_USE_API_MOCKS === 'true'`: Returns mock data after 300ms delay
- Otherwise: Executes the provided API function

---

## Usage Examples

### Basic API Call with Authentication
```typescript
import { api } from '@/services/api';

// Token is automatically attached if present in localStorage
const response = await api.get('/api/courses');
```

### Using Mock Data Toggle
```typescript
import { maybeMock } from '@/services/api';
import { mockCourses } from '@/mocks/courses';

// Will use mock data if VITE_USE_API_MOCKS=true
const courses = await maybeMock(
  mockCourses,
  async () => {
    const response = await api.get('/api/courses');
    return response.data;
  }
);
```

### Setting Authentication Token
```typescript
// After login
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...');

// All subsequent API calls will include this token
const response = await api.get('/api/users');

// Clear token on logout
localStorage.removeItem('token');
```

---

## Mock Mode Implementation

### Advantages
- **Fast Development:** Work without backend running
- **Consistent Data:** Predictable test scenarios
- **Offline Development:** No network dependency
- **Rapid Prototyping:** Quick UI iteration

### Configuration
```env
# .env.development
VITE_API_BASE_URL=http://localhost:5115
VITE_USE_API_MOCKS=true

# .env.production
VITE_API_BASE_URL=https://api.training-tracker.emerson.com
VITE_USE_API_MOCKS=false
```

### Mock Data Delay
The `maybeMock` helper includes a 300ms delay to simulate network latency:
```typescript
setTimeout(() => resolve(mockData), 300)
```

---

## Dependencies

### External Libraries
- **axios** (`^1.x`): HTTP client library

### Environment Variables
- `VITE_API_BASE_URL` (required): Backend API base URL
- `VITE_USE_API_MOCKS` (optional): Enable mock data mode

### Browser APIs
- **localStorage**: For token persistence

---

## Security Considerations

### Token Storage
⚠️ **Security Note:** Storing JWT tokens in localStorage has XSS vulnerability risks.

**Recommendations:**
- Use HttpOnly cookies for production
- Implement token refresh mechanism
- Set appropriate token expiration
- Sanitize all user inputs

### HTTPS Requirement
Always use HTTPS in production when using localStorage for tokens.

---

## Error Handling

### Standard Error Flow
```typescript
try {
  const response = await api.get('/api/courses');
} catch (error) {
  // Error is logged in development mode automatically
  // Handle error appropriately
  console.error('Failed to fetch courses:', error);
}
```

### Authentication Errors
Handle 401 Unauthorized responses to trigger re-login:
```typescript
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Integration Points

### Used By
- `src/context/AuthContext.tsx` - Authentication management
- Components requiring authenticated API calls
- Mock-enabled development workflows

### Depends On
- Backend API at `VITE_API_BASE_URL`
- Mock data files in `src/mocks/`
- localStorage for token persistence

### Related Services
- `src/services/apiClient.ts` - Alternative API client (no auth)
- `src/services/adminService.ts` - Admin-specific operations

---

## Comparison with apiClient.ts

| Feature | api.ts | apiClient.ts |
|---------|--------|--------------|
| Authentication | ✅ JWT tokens | ❌ No auth |
| Mock Support | ✅ Built-in | ❌ Not supported |
| Correlation ID | ❌ Not included | ✅ Auto-generated |
| Pre-built Methods | ❌ Generic | ✅ coursesApi, usersApi |
| Use Case | Auth-required calls | Public/system calls |

---

## Configuration Checklist

- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Configure mock mode with `VITE_USE_API_MOCKS`
- [ ] Prepare mock data files in `src/mocks/`
- [ ] Implement token management (login/logout)
- [ ] Test authentication flow
- [ ] Verify error handling in dev/prod modes

---

## Technical Notes

### Development vs Production
The service behaves differently based on environment:
- **Development:** Error logging enabled
- **Production:** Silent error handling (errors still thrown)

### Type Safety
The `maybeMock` helper is generic, preserving TypeScript types:
```typescript
interface Course { id: string; title: string; }
const courses = await maybeMock<Course[]>(mockData, apiCall);
// courses is correctly typed as Course[]
```

---

## Related Documentation
- [API Client Service](./apiClient_doc.md) - Non-authenticated API client
- [Admin Service](./adminService_doc.md) - Admin operations
- [Auth Context](../context/AuthContext_doc.md) - Authentication state

---

## Maintenance & Support

**Owner:** Frontend Team  
**Tech Lead:** melvin.reyes@emerson.com  
**Last Review:** January 23, 2026

---

<!-- AKR Documentation Metadata -->
<!-- Generated: 2026-01-23 -->
<!-- Template: service-standard -->
<!-- AI-Generated: true -->
