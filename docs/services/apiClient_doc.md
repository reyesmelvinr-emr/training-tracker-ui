# API Client Service Documentation

## Overview

**File:** `src/services/apiClient.ts`  
**Type:** HTTP Client Service  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Centralized HTTP client configuration for the Training Tracker UI application. Provides a configured Axios instance with request interceptors for correlation ID tracking and pre-configured API endpoints for courses and users.

### Key Responsibilities
- Configure base HTTP client with Axios
- Add correlation ID to all outgoing requests
- Provide structured API methods for courses and users
- Handle request/response lifecycle

---

## Service Configuration

### Base URL
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5115';
```

**Environment Variable:** `VITE_API_BASE_URL`  
**Default:** `http://localhost:5115`

### Headers
- `Content-Type`: `application/json`
- `X-Correlation-Id`: Auto-generated UUID per request

---

## Request Interceptors

### Correlation ID Interceptor
Automatically adds a unique correlation ID to every request for distributed tracing.

```typescript
api.interceptors.request.use((config) => {
  config.headers['X-Correlation-Id'] = crypto.randomUUID();
  return config;
});
```

**Purpose:** Enables request tracing across microservices  
**Implementation:** Uses native `crypto.randomUUID()` for UUID generation

---

## API Endpoints

### Courses API (`coursesApi`)

#### Methods

##### `getAll(page?, pageSize?)`
Retrieve paginated list of courses.

**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 20)

**Returns:** Promise with paginated course data

**Endpoint:** `GET /api/courses`

---

##### `getById(id)`
Retrieve a single course by ID.

**Parameters:**
- `id` (string, required): Course identifier

**Returns:** Promise with course details

**Endpoint:** `GET /api/courses/:id`

---

##### `create(course)`
Create a new course.

**Parameters:**
- `course` (object, required):
  - `title` (string): Course title
  - `isRequired` (boolean): Required course flag
  - `isActive` (boolean): Active status
  - `validityMonths` (number | null, optional): Course validity period
  - `category` (string | null, optional): Course category
  - `description` (string | null, optional): Course description

**Returns:** Promise with created course data

**Endpoint:** `POST /api/courses`

---

##### `update(id, course)`
Update an existing course.

**Parameters:**
- `id` (string, required): Course identifier
- `course` (object, required): Course data (same structure as create)

**Returns:** Promise with updated course data

**Endpoint:** `PUT /api/courses/:id`

---

##### `delete(id)`
Delete a course.

**Parameters:**
- `id` (string, required): Course identifier

**Returns:** Promise (void)

**Endpoint:** `DELETE /api/courses/:id`

---

### Users API (`usersApi`)

#### Methods

##### `getAll(page?, pageSize?)`
Retrieve paginated list of users.

**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 20)

**Returns:** Promise with paginated user data

**Endpoint:** `GET /api/users`

---

##### `getById(id)`
Retrieve a single user by ID.

**Parameters:**
- `id` (string, required): User identifier

**Returns:** Promise with user details

**Endpoint:** `GET /api/users/:id`

---

##### `create(user)`
Create a new user.

**Parameters:**
- `user` (object, required):
  - `email` (string): User email address
  - `fullName` (string): User's full name
  - `isActive` (boolean): Active status

**Returns:** Promise with created user data

**Endpoint:** `POST /api/users`

---

##### `update(id, user)`
Update an existing user.

**Parameters:**
- `id` (string, required): User identifier
- `user` (object, required): User data (same structure as create)

**Returns:** Promise with updated user data

**Endpoint:** `PUT /api/users/:id`

---

##### `delete(id)`
Delete a user.

**Parameters:**
- `id` (string, required): User identifier

**Returns:** Promise (void)

**Endpoint:** `DELETE /api/users/:id`

---

## Dependencies

### External Libraries
- **axios** (`^1.x`): HTTP client library

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL

---

## Usage Examples

### Basic Course Retrieval
```typescript
import { coursesApi } from '@/services/apiClient';

// Get all courses (first page)
const courses = await coursesApi.getAll();

// Get specific page with custom page size
const coursesPage2 = await coursesApi.getAll(2, 50);

// Get single course
const course = await coursesApi.getById('course-123');
```

### Creating a Course
```typescript
import { coursesApi } from '@/services/apiClient';

const newCourse = await coursesApi.create({
  title: 'Safety Training 101',
  isRequired: true,
  isActive: true,
  validityMonths: 12,
  category: 'Safety',
  description: 'Basic safety training for all employees'
});
```

### User Management
```typescript
import { usersApi } from '@/services/apiClient';

// Create user
const user = await usersApi.create({
  email: 'john.doe@emerson.com',
  fullName: 'John Doe',
  isActive: true
});

// Update user
await usersApi.update('user-123', {
  email: 'john.doe@emerson.com',
  fullName: 'John Doe',
  isActive: false
});
```

---

## Error Handling

All API methods use standard Axios error handling. Errors should be caught using try-catch blocks:

```typescript
try {
  const courses = await coursesApi.getAll();
} catch (error) {
  console.error('Failed to fetch courses:', error);
  // Handle error appropriately
}
```

---

## Integration Points

### Used By
- `src/hooks/useCourses.ts` - Course data fetching
- `src/hooks/useUsers.ts` - User data fetching
- React components requiring direct API access

### Depends On
- Backend API at `VITE_API_BASE_URL`
- Axios library for HTTP operations

---

## Configuration Checklist

- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Ensure backend API is accessible
- [ ] Verify CORS settings on backend
- [ ] Test correlation ID propagation

---

## Technical Notes

### Correlation ID Strategy
The service uses `crypto.randomUUID()` to generate correlation IDs. This requires:
- Modern browser support (Chrome 92+, Firefox 95+, Safari 15.4+)
- HTTPS in production (crypto API requirement)

### Type Safety
Consider defining TypeScript interfaces for:
- Course objects
- User objects
- API response structures
- Pagination metadata

---

## Related Documentation
- [API Service](./api_doc.md) - Alternative API client implementation
- [Admin Service](./adminService_doc.md) - Admin-specific API operations

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
