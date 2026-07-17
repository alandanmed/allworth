import { Account, LIABILITY_ACCOUNT_TYPES } from '@/types/finance';

export function calculateTotalAssets(accounts: Account[]): number {
  return accounts
    .filter((account) => !LIABILITY_ACCOUNT_TYPES.includes(account.type))
    .reduce((sum, account) => sum + account.balance, 0);
}

export function calculateTotalLiabilities(accounts: Account[]): number {
  return accounts
    .filter((account) => LIABILITY_ACCOUNT_TYPES.includes(account.type))
    .reduce((sum, account) => sum + account.balance, 0);
}

export function calculateNetWorth(accounts: Account[]): number {
  return calculateTotalAssets(accounts) - calculateTotalLiabilities(accounts);
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
