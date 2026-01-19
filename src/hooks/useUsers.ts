import { useEffect, useState } from 'react';
import { api, maybeMock } from '../services/api';

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdUtc: string;
}

export interface PagedUsers {
  items: UserSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useUsers(page = 1, pageSize = 10, enabled = true) {
  const [data, setData] = useState<PagedUsers | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true); setError(null);
    const mock: PagedUsers = {
      items: [
        { id: 'u1', email: 'alice@example.com', fullName: 'Alice Example', isActive: true, createdUtc: new Date().toISOString() },
        { id: 'u2', email: 'bob@example.com', fullName: 'Bob Example', isActive: true, createdUtc: new Date().toISOString() }
      ],
      page, pageSize, totalCount: 2, totalPages: 1
    };
    maybeMock(mock, async () => {
      const res = await api.get<PagedUsers>('/api/users', { params: { page, pageSize } });
      return res.data;
    }).then(r => { if (!cancelled) setData(r); })
      .catch(e => { if (!cancelled) setError(e?.message || 'Failed to load users'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, enabled, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { data, loading, error, refetch };
}
