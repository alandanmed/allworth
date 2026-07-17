export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';

/**
 * Whether an account type counts toward assets or liabilities.
 * checking / savings / investment = assets (money you have)
 * credit_card / loan = liabilities (money you owe)
 */
export const LIABILITY_ACCOUNT_TYPES: AccountType[] = ['credit_card', 'loan'];

export type Institution = {
  id: string;
  name: string;
  logoColor: string; // placeholder until we have real logos
};

export type Account = {
  id: string;
  institutionId: string;
  name: string;
  type: AccountType;
  /**
   * Always a positive number.
   * For asset accounts (checking/savings/investment): amount available.
   * For liability accounts (credit_card/loan): amount owed.
   */
  balance: number;
  lastFourDigits: string;
  syncStatus: 'connected' | 'manual' | 'error';
};

export type TransactionStatus = 'pending' | 'completed';

export type Transaction = {
  id: string;
  accountId: string;
  merchant: string;
  amount: number; // positive = money out (spending), negative = money in (income/refund)
  date: string; // ISO date string
  category: string;
  status: TransactionStatus;
  notes?: string;
};
