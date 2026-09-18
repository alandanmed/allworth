import { useMutation, useQuery } from '@tanstack/react-query';

import { apiGet, apiPost } from '@/api/client';
import { ApiDailySummary } from '@/api/types';

export type DailySummary = {
  date: string;
  totalSpent: number;
  totalIncome: number;
  byCategory: { category: string; total: number }[];
  dailyAverage: number;
  percentVsAverage: number | null;
  unusualTransactions: { merchant: string; amount: number; category: string }[];
  budgetWarnings: { category: string; percentUsed: number; isOverBudget: boolean }[];
};

function mapSummary(api: ApiDailySummary): DailySummary {
  return {
    date: api.date,
    totalSpent: Number(api.total_spent),
    totalIncome: Number(api.total_income),
    byCategory: api.by_category.map((c) => ({ category: c.category, total: Number(c.total) })),
    dailyAverage: Number(api.daily_average),
    percentVsAverage: api.percent_vs_average,
    unusualTransactions: api.unusual_transactions,
    budgetWarnings: api.budget_warnings.map((b) => ({
      category: b.category,
      percentUsed: b.percent_used,
      isOverBudget: b.is_over_budget,
    })),
  };
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: async () => mapSummary(await apiGet<ApiDailySummary>(`/summaries/daily/${date}`)),
  });
}

export function useGenerateDailySummary() {
  return useMutation({
    mutationFn: () => apiPost<ApiDailySummary>('/summaries/daily/generate'),
  });
}
