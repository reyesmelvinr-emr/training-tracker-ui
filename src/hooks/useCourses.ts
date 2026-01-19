import { useEffect, useState } from 'react';
import { api, maybeMock } from '../services/api';
import { pagedCoursesMock } from '../mocks/courses';

export interface CourseSummary {
  id: string;
  title: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface PagedCourses {
  items: CourseSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface UseCoursesOptions {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useCourses({ page = 1, pageSize = 10, enabled = true }: UseCoursesOptions = {}) {
  const [data, setData] = useState<PagedCourses | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let isCancelled = false;
    setLoading(true);
    setError(null);

    maybeMock(pagedCoursesMock(page, pageSize), async () => {
      const res = await api.get<PagedCourses>(`/api/courses`, { params: { page, pageSize } });
      return res.data;
    })
      .then((result) => {
        if (!isCancelled) setData(result);
      })
      .catch((e) => {
        if (!isCancelled) setError(e?.message || 'Failed to load courses');
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page, pageSize, enabled, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { data, loading, error, refetch };
}
