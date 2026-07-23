import { Transaction } from '@/types/finance';
import { detectRecurringTransactionIds } from './recurring';

export type Subscription = {
  merchant: string;
  category: string;
  latestAmount: number;
  previousAmount?: number;
  priceChanged: boolean;
  occurrences: number;
  lastDate: string;
};

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const recurringIds = detectRecurringTransactionIds(transactions);
  const recurringTransactions = transactions.filter((t) => recurringIds.has(t.id));

  const byMerchant = new Map<string, Transaction[]>();
  recurringTransactions.forEach((t) => {
    const existing = byMerchant.get(t.merchant) ?? [];
    existing.push(t);
    byMerchant.set(t.merchant, existing);
  });

  const subscriptions: Subscription[] = [];

  byMerchant.forEach((txns, merchant) => {
    const sorted = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    const previous = sorted[1];
    const priceChanged = previous !== undefined && Math.abs(latest.amount - previous.amount) > 0.01;

    subscriptions.push({
      merchant,
      category: latest.category,
      latestAmount: latest.amount,
      previousAmount: previous?.amount,
      priceChanged,
      occurrences: sorted.length,
      lastDate: latest.date,
    });
  });

  return subscriptions.sort((a, b) => b.latestAmount - a.latestAmount);
}

export function calculateTotalMonthlySubscriptionCost(subscriptions: Subscription[]): number {
  return subscriptions.reduce((sum, s) => sum + s.latestAmount, 0);
}
