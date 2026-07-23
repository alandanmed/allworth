import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPost } from '@/api/client';
import { ApiBudget } from '@/api/types';

export type Budget = {
  id: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  spentThisMonth: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
};

function mapBudget(api: ApiBudget): Budget {
  return {
    id: api.id,
    categoryId: api.category.id,
    categoryName: api.category.name,
    monthlyLimit: Number(api.monthly_limit),
    spentThisMonth: Number(api.spent_this_month),
    remaining: Number(api.remaining),
    percentUsed: api.percent_used,
    isOverBudget: api.is_over_budget,
  };
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const budgets = await apiGet<ApiBudget[]>('/budgets');
      return budgets.map(mapBudget);
    },
  });
}

export function useSaveBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, monthlyLimit }: { categoryId: string; monthlyLimit: number }) =>
      apiPost<ApiBudget>('/budgets', { category_id: categoryId, monthly_limit: monthlyLimit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
