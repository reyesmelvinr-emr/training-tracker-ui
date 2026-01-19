import { useEffect, useState, useCallback } from 'react';
import { api, maybeMock } from '../services/api';

export interface EnrollmentSummary {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  enrolledUtc: string;
  completedUtc?: string | null;
}

export interface PagedEnrollments {
  items: EnrollmentSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useEnrollments(page = 1, pageSize = 10, enabled = true) {
  const [data, setData] = useState<PagedEnrollments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false; setLoading(true); setError(null);
    const mock: PagedEnrollments = {
      items: [],
      page, pageSize, totalCount: 0, totalPages: 0
    };
    maybeMock(mock, async () => {
      const res = await api.get<PagedEnrollments>('/api/enrollments', { params: { page, pageSize } });
      return res.data;
    }).then(r => { if (!cancelled) setData(r); })
      .catch(e => { if (!cancelled) setError(e?.message || 'Failed to load enrollments'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, enabled, refetchTrigger]);

  return { data, loading, error, refetch };
}
