import { Transaction } from '@/types/finance';

const AMOUNT_TOLERANCE_PERCENT = 0.1; // 10% — catches small subscription price changes
// A charge has to show up in this many different calendar months to count as
// recurring. Two hits in one or two months is usually just a regular store.
const MIN_DISTINCT_MONTHS_TO_FLAG = 3;

function amountsAreSimilar(a: number, b: number): boolean {
  const larger = Math.max(Math.abs(a), Math.abs(b));
  if (larger === 0) return a === b;
  return Math.abs(a - b) / larger <= AMOUNT_TOLERANCE_PERCENT;
}

/**
 * Returns the set of transaction IDs that appear to be recurring charges —
 * same merchant, similar amount, in 3+ different calendar months. Income and
 * refunds (negative amounts in this app) are never treated as recurring
 * charges.
 */
export function detectRecurringTransactionIds(transactions: Transaction[]): Set<string> {
  const byMerchant = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    if (txn.amount <= 0) continue;
    const existing = byMerchant.get(txn.merchant) ?? [];
    existing.push(txn);
    byMerchant.set(txn.merchant, existing);
  }

  const recurringIds = new Set<string>();

  for (const merchantTransactions of byMerchant.values()) {
    if (merchantTransactions.length < MIN_DISTINCT_MONTHS_TO_FLAG) continue;

    // Check if similar-amount transactions span enough distinct months
    for (let i = 0; i < merchantTransactions.length; i++) {
      const matchesForThis = merchantTransactions.filter((other) =>
        amountsAreSimilar(merchantTransactions[i].amount, other.amount)
      );
      const distinctMonths = new Set(matchesForThis.map((t) => t.date.slice(0, 7)));
      if (distinctMonths.size >= MIN_DISTINCT_MONTHS_TO_FLAG) {
        matchesForThis.forEach((t) => recurringIds.add(t.id));
      }
    }
  }

  return recurringIds;
}
