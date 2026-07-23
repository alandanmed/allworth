import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/api/client';
import { ApiSpendingSummary } from '@/api/types';

export type SpendingSummary = {
  month: string;
  totalSpent: number;
  previousMonthTotalSpent: number;
  percentChange: number | null;
  byCategory: { category: string; total: number }[];
};

function mapSummary(api: ApiSpendingSummary): SpendingSummary {
  return {
    month: api.month,
    totalSpent: Number(api.total_spent),
    previousMonthTotalSpent: Number(api.previous_month_total_spent),
    percentChange: api.percent_change,
    byCategory: api.by_category.map((c) => ({
      category: c.category,
      total: Number(c.total),
    })),
  };
}

export function useSpendingSummary() {
  return useQuery({
    queryKey: ['spending-summary'],
    queryFn: async () => mapSummary(await apiGet<ApiSpendingSummary>('/analytics/spending-summary')),
  });
}
