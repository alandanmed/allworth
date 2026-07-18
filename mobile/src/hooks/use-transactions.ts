import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/api/client';
import { ApiTransaction } from '@/api/types';
import { Transaction } from '@/types/finance';

function mapTransaction(api: ApiTransaction): Transaction {
  return {
    id: api.id,
    accountId: api.account_id,
    merchant: api.merchant,
    amount: api.amount,
    date: api.date,
    category: api.category?.name ?? 'Uncategorized',
    status: api.status as Transaction['status'],
    notes: api.notes ?? undefined,
  };
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const apiTransactions = await apiGet<ApiTransaction[]>('/transactions');
      return apiTransactions.map(mapTransaction);
    },
  });
}

export function useTransaction(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => mapTransaction(await apiGet<ApiTransaction>(`/transactions/${transactionId}`)),
    enabled: !!transactionId,
  });
}
