import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiDelete, apiGet, apiPost } from '@/api/client';
import { ApiBankConnection, ApiSyncResult } from '@/api/types';

export function useBankConnections() {
  return useQuery({
    queryKey: ['bank-connections'],
    queryFn: () => apiGet<ApiBankConnection[]>('/plaid/connections'),
  });
}

export function useConnectSandboxBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<ApiBankConnection>('/plaid/connect-sandbox', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-connections'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useSyncConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      apiPost<ApiSyncResult>(`/plaid/connections/${connectionId}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDisconnectBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => apiDelete(`/plaid/connections/${connectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-connections'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
