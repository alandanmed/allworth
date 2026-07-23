import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/api/client';
import { ApiCategory } from '@/api/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<ApiCategory[]>('/categories'),
  });
}
