import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch } from '@/api/client';
import { ApiUserPreferences } from '@/api/types';

export function useUserPreferences() {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: () => apiGet<ApiUserPreferences>('/users/me/preferences'),
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dailySummaryEnabled: boolean) =>
      apiPatch<ApiUserPreferences>('/users/me/preferences', {
        daily_summary_enabled: dailySummaryEnabled,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['user-preferences'], data);
    },
  });
}
