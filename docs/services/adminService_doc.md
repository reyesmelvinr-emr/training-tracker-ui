# Admin Service Documentation

## Overview

**File:** `src/services/adminService.ts`  
**Type:** Admin API Service  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Dedicated service for administrative operations including system statistics, health monitoring, and bulk user management. Provides type-safe interfaces for admin-specific API endpoints.

### Key Responsibilities
- Fetch system-wide statistics
- Monitor API and database health
- Perform bulk user status updates
- Provide type definitions for admin data structures

---

## Configuration

### API Base URL
```typescript
const API_BASE_URL = 'http://localhost:5115/api';
```

⚠️ **Note:** Base URL is hardcoded. Consider using environment variables:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api' || 'http://localhost:5115/api';
```

---

## Type Definitions

### StatisticsData
System-wide statistics interface.

```typescript
interface StatisticsData {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  
  // Course Statistics
  totalCourses: number;
  requiredCourses: number;
  optionalCourses: number;
  
  // Enrollment Statistics
  totalEnrollments: number;
  pendingEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  
  // Metrics
  completionRate: number; // Percentage (0-100)
}
```

---

### HealthData
System health status interface.

```typescript
interface HealthData {
  apiStatus: string;           // e.g., "healthy", "degraded", "down"
  databaseStatus: string;      // e.g., "connected", "disconnected"
  databaseError?: string;      // Error message if database check fails
  timestamp: string;           // ISO 8601 timestamp
}
```

---

### BulkUpdateRequest
Request payload for bulk user status updates.

```typescript
interface BulkUpdateRequest {
  userIds: string[];          // Array of user IDs to update
  isActive: boolean;          // New active status for all users
}
```

---

### BulkUpdateResponse
Response from bulk user status update operation.

```typescript
interface BulkUpdateResponse {
  totalRequested: number;     // Number of users requested to update
  successCount: number;       // Successfully updated users
  failedCount: number;        // Failed update attempts
  errors: string[];           // Array of error messages
}
```

---

## Service Methods

### `getStatistics()`
Retrieve comprehensive system statistics.

**Type Signature:**
```typescript
async getStatistics(): Promise<StatisticsData>
```

**Returns:** Promise resolving to system statistics

**Endpoint:** `GET /api/admin/statistics`

**Example:**
```typescript
const stats = await adminService.getStatistics();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Completion Rate: ${stats.completionRate}%`);
```

---

### `getHealth()`
Check system health status.

**Type Signature:**
```typescript
async getHealth(): Promise<HealthData>
```

**Returns:** Promise resolving to health status

**Endpoint:** `GET /api/admin/health`

**Example:**
```typescript
const health = await adminService.getHealth();
if (health.databaseStatus !== 'connected') {
  console.error('Database issue:', health.databaseError);
}
```

---

### `bulkUpdateUserStatus(request)`
Update active status for multiple users simultaneously.

**Type Signature:**
```typescript
async bulkUpdateUserStatus(request: BulkUpdateRequest): Promise<BulkUpdateResponse>
```

**Parameters:**
- `request.userIds` (string[]): Array of user IDs
- `request.isActive` (boolean): New status to apply

**Returns:** Promise resolving to update results

**Endpoint:** `PATCH /api/admin/users/bulk-status`

**Example:**
```typescript
const result = await adminService.bulkUpdateUserStatus({
  userIds: ['user-1', 'user-2', 'user-3'],
  isActive: false
});

console.log(`Updated ${result.successCount} of ${result.totalRequested} users`);
if (result.failedCount > 0) {
  console.error('Errors:', result.errors);
}
```

---

## Usage Examples

### Dashboard Statistics Display
```typescript
import { adminService } from '@/services/adminService';

async function loadDashboardStats() {
  try {
    const stats = await adminService.getStatistics();
    
    return {
      userMetrics: {
        total: stats.totalUsers,
        active: stats.activeUsers,
        inactive: stats.inactiveUsers
      },
      courseMetrics: {
        total: stats.totalCourses,
        required: stats.requiredCourses,
        optional: stats.optionalCourses
      },
      enrollmentMetrics: {
        total: stats.totalEnrollments,
        completed: stats.completedEnrollments,
        completionRate: stats.completionRate
      }
    };
  } catch (error) {
    console.error('Failed to load statistics:', error);
    throw error;
  }
}
```

---

### Health Monitoring
```typescript
import { adminService } from '@/services/adminService';

async function checkSystemHealth() {
  try {
    const health = await adminService.getHealth();
    
    const isHealthy = 
      health.apiStatus === 'healthy' && 
      health.databaseStatus === 'connected';
    
    if (!isHealthy) {
      // Alert administrators
      console.warn('System health issue detected:', health);
    }
    
    return health;
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      apiStatus: 'down',
      databaseStatus: 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}
```

---

### Bulk User Deactivation
```typescript
import { adminService } from '@/services/adminService';

async function deactivateUsers(userIds: string[]) {
  if (userIds.length === 0) {
    throw new Error('No users selected');
  }
  
  try {
    const result = await adminService.bulkUpdateUserStatus({
      userIds,
      isActive: false
    });
    
    if (result.failedCount > 0) {
      console.warn(`${result.failedCount} users failed to deactivate:`, result.errors);
    }
    
    return {
      success: result.successCount,
      failed: result.failedCount,
      errors: result.errors
    };
  } catch (error) {
    console.error('Bulk deactivation failed:', error);
    throw error;
  }
}
```

---

## Error Handling

### Standard Error Handling
```typescript
try {
  const stats = await adminService.getStatistics();
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - user lacks admin permissions
      console.error('Admin access required');
    } else {
      console.error('API error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Bulk Update Error Handling
```typescript
const result = await adminService.bulkUpdateUserStatus({
  userIds: selectedUsers,
  isActive: false
});

if (result.failedCount > 0) {
  // Partial success - some users failed
  alert(`Updated ${result.successCount} users. ${result.failedCount} failed.`);
  
  // Log individual errors
  result.errors.forEach(error => console.error(error));
}
```

---

## Dependencies

### External Libraries
- **axios** (`^1.x`): HTTP client library

### Environment Variables
None currently (uses hardcoded URL)

**Recommended:**
- `VITE_API_BASE_URL`: Backend API base URL

---

## Integration Points

### Used By
- `src/hooks/useAdmin.ts` - Admin data hook
- `src/pages/AdminPanel.tsx` - Admin dashboard
- Admin-specific components

### Depends On
- Backend API at `/api/admin/*` endpoints
- Authentication (assumes user has admin role)

### Related Services
- `src/services/api.ts` - Generic API client with auth
- `src/services/apiClient.ts` - Alternative API client

---

## Security Considerations

### Authorization Required
All endpoints require admin-level permissions. Ensure:
- User is authenticated
- User has admin role
- Backend validates permissions

### Sensitive Operations
- **Bulk Updates:** Can affect multiple users simultaneously
- **Statistics:** May contain sensitive business metrics
- **Health Data:** Could reveal system vulnerabilities

**Best Practices:**
- Implement confirmation dialogs for bulk operations
- Log all admin actions for audit trail
- Rate limit bulk operations
- Validate user permissions on frontend and backend

---

## Performance Considerations

### Statistics Endpoint
- May be expensive on large datasets
- Consider caching with reasonable TTL (e.g., 5 minutes)
- Implement pagination if dataset grows

### Bulk Updates
- Limited to reasonable batch sizes (recommend max 100 users)
- Consider implementing progress indicators
- May trigger database locks - handle timeouts

---

## Configuration Checklist

- [ ] Update API_BASE_URL to use environment variables
- [ ] Implement authentication interceptor
- [ ] Add error boundary for admin panel
- [ ] Set up admin role verification
- [ ] Configure audit logging for admin actions
- [ ] Test bulk update with various batch sizes
- [ ] Implement statistics caching

---

## Technical Notes

### Type Safety
All methods use TypeScript interfaces for type safety. This ensures:
- Compile-time type checking
- IDE autocomplete support
- Reduced runtime errors

### Axios vs Fetch
This service uses Axios directly rather than the configured instances from `api.ts` or `apiClient.ts`. Consider:
- Migrating to shared API client for consistency
- Adding correlation IDs
- Using configured interceptors

---

## Future Improvements

1. **Environment Configuration:**
   ```typescript
   const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
   ```

2. **Shared Axios Instance:**
   ```typescript
   import { api } from './api';
   // Use api instance instead of creating new axios calls
   ```

3. **Statistics Caching:**
   ```typescript
   let cachedStats: StatisticsData | null = null;
   let cacheExpiry: number = 0;
   ```

4. **Bulk Update Progress:**
   ```typescript
   async bulkUpdateUserStatus(
     request: BulkUpdateRequest,
     onProgress?: (progress: number) => void
   )
   ```

---

## Related Documentation
- [Admin Hook](../hooks/useAdmin_doc.md) - React hook for admin operations
- [Admin Panel](../pages/AdminPanel_doc.md) - Admin UI component
- [API Service](./api_doc.md) - Generic API client

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
