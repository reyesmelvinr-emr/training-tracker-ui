import { format } from 'date-fns';

export function formatDate(date: string | Date | null | undefined, pattern = 'MMM d, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
}
