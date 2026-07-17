import { Transaction } from '@/types/finance';

const DUPLICATE_WINDOW_DAYS = 3;

function daysBetween(dateA: string, dateB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(new Date(dateA).getTime() - new Date(dateB).getTime()) / msPerDay;
}

/**
 * Returns the set of transaction IDs that appear to be accidental duplicate
 * charges — same merchant, identical amount, within a short time window.
 * Unlike recurring detection, this requires an EXACT amount match, since a
 * duplicate charge should be identical, not just "similar."
 */
export function detectDuplicateTransactionIds(transactions: Transaction[]): Set<string> {
  const duplicateIds = new Set<string>();
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const gap = daysBetween(sorted[i].date, sorted[j].date);
      if (gap > DUPLICATE_WINDOW_DAYS) break; // sorted by date, so nothing further out matters

      if (sorted[i].merchant === sorted[j].merchant && sorted[i].amount === sorted[j].amount) {
        duplicateIds.add(sorted[i].id);
        duplicateIds.add(sorted[j].id);
      }
    }
  }

  return duplicateIds;
}
