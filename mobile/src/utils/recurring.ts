import { Transaction } from '@/types/finance';

const AMOUNT_TOLERANCE_PERCENT = 0.1; // 10% — catches small subscription price changes
const MIN_OCCURRENCES_TO_FLAG = 2;

function amountsAreSimilar(a: number, b: number): boolean {
  const larger = Math.max(Math.abs(a), Math.abs(b));
  if (larger === 0) return a === b;
  return Math.abs(a - b) / larger <= AMOUNT_TOLERANCE_PERCENT;
}

/**
 * Returns the set of transaction IDs that appear to be recurring charges —
 * same merchant, similar amount, appearing 2+ times.
 */
export function detectRecurringTransactionIds(transactions: Transaction[]): Set<string> {
  const byMerchant = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    const existing = byMerchant.get(txn.merchant) ?? [];
    existing.push(txn);
    byMerchant.set(txn.merchant, existing);
  }

  const recurringIds = new Set<string>();

  for (const merchantTransactions of byMerchant.values()) {
    if (merchantTransactions.length < MIN_OCCURRENCES_TO_FLAG) continue;

    // Check if at least MIN_OCCURRENCES_TO_FLAG transactions have similar amounts
    for (let i = 0; i < merchantTransactions.length; i++) {
      const matchesForThis = merchantTransactions.filter((other) =>
        amountsAreSimilar(merchantTransactions[i].amount, other.amount)
      );
      if (matchesForThis.length >= MIN_OCCURRENCES_TO_FLAG) {
        matchesForThis.forEach((t) => recurringIds.add(t.id));
      }
    }
  }

  return recurringIds;
}
