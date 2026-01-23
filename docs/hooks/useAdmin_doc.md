# useAdmin Hooks Documentation

## Overview

**File:** `src/hooks/useAdmin.ts`  
**Type:** React Custom Hooks  
**Team:** Frontend Team  
**Last Updated:** January 23, 2026

### Purpose
Collection of React hooks for managing admin panel data including system statistics and health monitoring. Provides automatic data fetching, loading states, error handling, and refresh capabilities with built-in polling for health checks.

### Key Features
- Automatic data fetching on mount
- Loading and error state management
- Manual refetch capability
- Auto-refresh health checks (30-second interval)
- TypeScript type safety
- Error logging

---

## Exported Hooks

### 1. `useStatistics()`
### 2. `useHealth()`

---

## useStatistics Hook

### Purpose
Fetches and manages system-wide statistics including user, course, and enrollment metrics.

### Hook Signature
```typescript
function useStatistics(): {
  statistics: StatisticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `statistics` | `StatisticsData \| null` | Statistics data or null if not loaded |
| `loading` | `boolean` | True while fetching data |
| `error` | `string \| null` | Error message or null |
| `refetch` | `() => Promise<void>` | Function to manually refetch data |

### StatisticsData Type
```typescript
interface StatisticsData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalCourses: number;
  requiredCourses: number;
  optionalCourses: number;
  totalEnrollments: number;
  pendingEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  completionRate: number;
}
```

---

## useHealth Hook

### Purpose
Monitors system health including API and database status with automatic 30-second polling.

### Hook Signature
```typescript
function useHealth(): {
  health: HealthData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `health` | `HealthData \| null` | Health status data or null |
| `loading` | `boolean` | True while fetching data |
| `error` | `string \| null` | Error message or null |
| `refetch` | `() => Promise<void>` | Function to manually refetch data |

### HealthData Type
```typescript
interface HealthData {
  apiStatus: string;
  databaseStatus: string;
  databaseError?: string;
  timestamp: string;
}
```

### Auto-Refresh Behavior
- **Initial fetch:** On component mount
- **Polling interval:** Every 30 seconds
- **Cleanup:** Clears interval on unmount

---

## State Management

### Internal State

#### useStatistics
- `statistics` - Stores fetched statistics data
- `loading` - Tracks loading state
- `error` - Stores error messages

#### useHealth
- `health` - Stores health check data
- `loading` - Tracks loading state
- `error` - Stores error messages

### State Flow
```
Initial: loading=true, data=null, error=null
  ↓
Fetching...
  ↓
Success: loading=false, data=result, error=null
  OR
Error: loading=false, data=null, error=message
```

---

## Usage Examples

### Basic Statistics Display
```typescript
import { useStatistics } from '@/hooks/useAdmin';

function AdminDashboard() {
  const { statistics, loading, error, refetch } = useStatistics();

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!statistics) return null;

  return (
    <div>
      <h2>System Statistics</h2>
      <div>Total Users: {statistics.totalUsers}</div>
      <div>Active Users: {statistics.activeUsers}</div>
      <div>Total Courses: {statistics.totalCourses}</div>
      <div>Completion Rate: {statistics.completionRate}%</div>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

### Statistics Dashboard Cards
```typescript
import { useStatistics } from '@/hooks/useAdmin';
import { Card } from '@/components/common/Card';

function StatsDashboard() {
  const { statistics, loading, error } = useStatistics();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stats-grid">
      <Card title="Users">
        <div className="stat-large">{statistics?.totalUsers}</div>
        <div className="stat-detail">
          {statistics?.activeUsers} active, {statistics?.inactiveUsers} inactive
        </div>
      </Card>

      <Card title="Courses">
        <div className="stat-large">{statistics?.totalCourses}</div>
        <div className="stat-detail">
          {statistics?.requiredCourses} required, {statistics?.optionalCourses} optional
        </div>
      </Card>

      <Card title="Enrollments">
        <div className="stat-large">{statistics?.totalEnrollments}</div>
        <div className="stat-detail">
          Completion Rate: {statistics?.completionRate}%
        </div>
      </Card>
    </div>
  );
}
```

---

### Health Status Monitor
```typescript
import { useHealth } from '@/hooks/useAdmin';
import { StatusBadge } from '@/components/common/StatusBadge';

function HealthMonitor() {
  const { health, loading, error, refetch } = useHealth();

  if (loading && !health) {
    return <div>Checking system health...</div>;
  }

  const getStatusTone = (status: string) => {
    if (status === 'healthy' || status === 'connected') return 'success';
    if (status === 'degraded') return 'warning';
    return 'danger';
  };

  return (
    <Card title="System Health">
      {error && <div className="error">{error}</div>}
      
      {health && (
        <>
          <div>
            <strong>API Status:</strong>{' '}
            <StatusBadge tone={getStatusTone(health.apiStatus)}>
              {health.apiStatus}
            </StatusBadge>
          </div>
          
          <div>
            <strong>Database:</strong>{' '}
            <StatusBadge tone={getStatusTone(health.databaseStatus)}>
              {health.databaseStatus}
            </StatusBadge>
          </div>
          
          {health.databaseError && (
            <div className="error-detail">{health.databaseError}</div>
          )}
          
          <div className="timestamp">
            Last checked: {new Date(health.timestamp).toLocaleString()}
          </div>
          
          <button onClick={refetch}>Check Now</button>
        </>
      )}
    </Card>
  );
}
```

---

### Combined Admin Panel
```typescript
import { useStatistics, useHealth } from '@/hooks/useAdmin';

function AdminPanel() {
  const stats = useStatistics();
  const health = useHealth();

  return (
    <div>
      <h1>Admin Panel</h1>
      
      <section>
        <h2>System Health</h2>
        {health.loading && <div>Loading...</div>}
        {health.error && <div>Error: {health.error}</div>}
        {health.health && (
          <div>
            API: {health.health.apiStatus} | 
            DB: {health.health.databaseStatus}
          </div>
        )}
      </section>
      
      <section>
        <h2>Statistics</h2>
        {stats.loading && <div>Loading...</div>}
        {stats.error && <div>Error: {stats.error}</div>}
        {stats.statistics && (
          <div>
            <p>Users: {stats.statistics.totalUsers}</p>
            <p>Courses: {stats.statistics.totalCourses}</p>
            <p>Enrollments: {stats.statistics.totalEnrollments}</p>
          </div>
        )}
      </section>
    </div>
  );
}
```

---

### With Periodic Manual Refresh
```typescript
import { useStatistics } from '@/hooks/useAdmin';
import { useEffect } from 'react';

function AutoRefreshStats() {
  const { statistics, loading, error, refetch } = useStatistics();

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div>
      <h2>Statistics (Auto-refresh: 5min)</h2>
      {/* Display statistics */}
    </div>
  );
}
```

---

### Error Handling
```typescript
import { useStatistics } from '@/hooks/useAdmin';
import { useEffect } from 'react';

function StatsWithErrorHandling() {
  const { statistics, loading, error, refetch } = useStatistics();

  useEffect(() => {
    if (error) {
      // Log to monitoring service
      console.error('Statistics fetch failed:', error);
      
      // Show toast notification
      toast.error('Failed to load statistics');
      
      // Retry after 5 seconds
      const timeout = setTimeout(() => {
        refetch();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [error, refetch]);

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  
  return <StatisticsDisplay data={statistics} />;
}
```

---

## Integration Points

### Dependencies

#### Internal
- `@/services/adminService` - Admin API calls
  - `getStatistics()`
  - `getHealth()`
  - Type definitions: `StatisticsData`, `HealthData`

#### External
- `react` - useState, useEffect

### Used By
- Admin panel page
- Dashboard widgets
- System monitoring components
- Health check displays

---

## Error Handling

### Error Capture
Both hooks catch and handle errors gracefully:

```typescript
try {
  const data = await adminService.getStatistics();
  setStatistics(data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load statistics');
  console.error('Error fetching statistics:', err);
}
```

### Error States
- Network errors
- API errors (4xx, 5xx)
- Timeout errors
- Parsing errors

### Error Recovery
```typescript
// Manual retry
const handleRetry = () => {
  refetch();
};

// Automatic retry with exponential backoff
const [retryCount, setRetryCount] = useState(0);

useEffect(() => {
  if (error && retryCount < 3) {
    const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    const timeout = setTimeout(() => {
      refetch();
      setRetryCount(prev => prev + 1);
    }, delay);
    
    return () => clearTimeout(timeout);
  }
}, [error, retryCount, refetch]);
```

---

## Performance Considerations

### Auto-Refresh Impact
The `useHealth` hook polls every 30 seconds:
- **Network usage:** ~2 requests per minute
- **Battery impact:** Minimal for modern devices
- **Server load:** Consider rate limiting for many concurrent users

### Optimization Strategies

#### 1. Conditional Polling
```typescript
function useHealth(enablePolling = true) {
  useEffect(() => {
    fetchHealth();
    
    if (enablePolling) {
      const interval = setInterval(fetchHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [enablePolling]);
}
```

---

#### 2. Visibility-Based Polling
```typescript
import { useState, useEffect } from 'react';

function useHealth() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    fetchHealth();
    
    // Only poll when tab is visible
    if (isVisible) {
      const interval = setInterval(fetchHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // ... rest of hook
}
```

---

#### 3. Memoization for Expensive Calculations
```typescript
import { useMemo } from 'react';

function AdminStats() {
  const { statistics } = useStatistics();

  const enrollmentMetrics = useMemo(() => {
    if (!statistics) return null;
    
    return {
      activeRate: (statistics.activeEnrollments / statistics.totalEnrollments) * 100,
      pendingRate: (statistics.pendingEnrollments / statistics.totalEnrollments) * 100,
      // ... other calculations
    };
  }, [statistics]);

  return <div>{/* Display metrics */}</div>;
}
```

---

## Testing

### Test Scenarios
1. Fetches data on mount
2. Sets loading state correctly
3. Handles successful responses
4. Handles error responses
5. Refetch function works
6. Health polling interval works
7. Cleans up intervals on unmount

### Example Tests
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useStatistics, useHealth } from './useAdmin';
import { adminService } from '@/services/adminService';

jest.mock('@/services/adminService');

describe('useStatistics', () => {
  it('fetches statistics on mount', async () => {
    const mockData = {
      totalUsers: 100,
      activeUsers: 80,
      totalCourses: 50,
      // ... other fields
    };
    
    (adminService.getStatistics as jest.Mock).mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useStatistics());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.statistics).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });
  
  it('handles errors', async () => {
    (adminService.getStatistics as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );
    
    const { result } = renderHook(() => useStatistics());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Network error');
    expect(result.current.statistics).toBeNull();
  });
  
  it('refetches data when refetch is called', async () => {
    const mockData = { totalUsers: 100, /* ... */ };
    (adminService.getStatistics as jest.Mock).mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useStatistics());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Call refetch
    result.current.refetch();
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(adminService.getStatistics).toHaveBeenCalledTimes(2);
  });
});

describe('useHealth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('polls health every 30 seconds', async () => {
    const mockHealth = {
      apiStatus: 'healthy',
      databaseStatus: 'connected',
      timestamp: new Date().toISOString()
    };
    
    (adminService.getHealth as jest.Mock).mockResolvedValue(mockHealth);
    
    renderHook(() => useHealth());
    
    await waitFor(() => {
      expect(adminService.getHealth).toHaveBeenCalledTimes(1);
    });
    
    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);
    
    await waitFor(() => {
      expect(adminService.getHealth).toHaveBeenCalledTimes(2);
    });
  });
});
```

---

## Common Patterns

### Loading Skeleton
```typescript
function StatsWithSkeleton() {
  const { statistics, loading } = useStatistics();

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </Card>
        ))}
      </div>
    );
  }

  return <StatisticsDisplay data={statistics} />;
}
```

---

### Stale Data Indicator
```typescript
function HealthWithFreshness() {
  const { health, refetch } = useHealth();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    if (health) {
      setLastUpdate(Date.now());
    }
  }, [health]);

  const isStale = Date.now() - lastUpdate > 60000; // 1 minute

  return (
    <div>
      {isStale && <div className="warning">Data may be outdated</div>}
      {/* Display health */}
    </div>
  );
}
```

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Required Features
- React Hooks (React 16.8+)
- Async/await
- setInterval/clearInterval

---

## Related Documentation
- [Admin Service](../services/adminService_doc.md) - API service layer
- [Admin Panel Page](../pages/AdminPanel_doc.md) - Main consumer
- [Card Component](../components/Card_doc.md) - Display container
- [StatusBadge Component](../components/StatusBadge_doc.md) - Status indicators

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
