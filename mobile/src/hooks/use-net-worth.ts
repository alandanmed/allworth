import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPost } from '@/api/client';
import { ApiNetWorthSnapshot } from '@/api/types';

export type NetWorthSnapshot = {
  date: string;
  netWorth: number;
};

function mapSnapshot(api: ApiNetWorthSnapshot): NetWorthSnapshot {
  return {
    date: api.date,
    netWorth: Number(api.net_worth),
  };
}

export function useNetWorthHistory() {
  return useQuery({
    queryKey: ['net-worth-history'],
    queryFn: async () => {
      const snapshots = await apiGet<ApiNetWorthSnapshot[]>('/net-worth/history');
      return snapshots.map(mapSnapshot);
    },
  });
}

export function useRecordTodaysSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<ApiNetWorthSnapshot>('/net-worth/snapshot'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-history'] });
    },
  });
}
