import { PagedCourses } from '../hooks/useCourses';

export const pagedCoursesMock = (page = 1, pageSize = 10): PagedCourses => ({
  items: [
    { id: 'mock-1', title: 'Mock Safety Orientation', isRequired: true, isActive: true },
    { id: 'mock-2', title: 'Mock Leadership Essentials', isRequired: false, isActive: true }
  ],
  page,
  pageSize,
  totalCount: 2,
  totalPages: 1
});

export const emptyCoursesMock: PagedCourses = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0
};