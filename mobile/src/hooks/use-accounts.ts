import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/api/client';
import { ApiAccount } from '@/api/types';
import { Account, Institution } from '@/types/finance';

function mapAccount(api: ApiAccount): Account {
  return {
    id: api.id,
    institutionId: api.institution.id,
    name: api.name,
    type: api.type as Account['type'],
    balance: Number(api.balance),
    lastFourDigits: api.last_four_digits,
    syncStatus: api.sync_status as Account['syncStatus'],
  };
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const apiAccounts = await apiGet<ApiAccount[]>('/accounts');

      const institutionMap = new Map<string, Institution>();
      apiAccounts.forEach((a) => {
        institutionMap.set(a.institution.id, {
          id: a.institution.id,
          name: a.institution.name,
          logoColor: a.institution.logo_color ?? '#999999',
        });
      });

      return {
        accounts: apiAccounts.map(mapAccount),
        institutions: Array.from(institutionMap.values()),
      };
    },
  });
}

export function useAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => mapAccount(await apiGet<ApiAccount>(`/accounts/${accountId}`)),
    enabled: !!accountId,
  });
}
