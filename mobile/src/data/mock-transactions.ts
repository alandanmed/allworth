import { Transaction } from '@/types/finance';

export const mockTransactions: Transaction[] = [
  { id: 'txn-1', accountId: 'acct-checking', merchant: 'Trader Joe\'s', amount: 64.32, date: '2026-07-15', category: 'Groceries', status: 'completed' },
  { id: 'txn-2', accountId: 'acct-credit', merchant: 'Netflix', amount: 15.49, date: '2026-07-14', category: 'Subscriptions', status: 'completed' },
  { id: 'txn-3', accountId: 'acct-checking', merchant: 'Shell Gas Station', amount: 42.10, date: '2026-07-14', category: 'Transportation', status: 'completed' },
  { id: 'txn-4', accountId: 'acct-credit', merchant: 'Amazon', amount: 128.90, date: '2026-07-13', category: 'Shopping', status: 'pending' },
  { id: 'txn-5', accountId: 'acct-checking', merchant: 'Payroll Deposit', amount: -2100.0, date: '2026-07-12', category: 'Income', status: 'completed' },
  { id: 'txn-6', accountId: 'acct-credit', merchant: 'Spotify', amount: 11.99, date: '2026-07-11', category: 'Subscriptions', status: 'completed' },
  { id: 'txn-7', accountId: 'acct-checking', merchant: 'Chipotle', amount: 13.75, date: '2026-07-10', category: 'Dining', status: 'completed' },
  { id: 'txn-8', accountId: 'acct-credit', merchant: 'Delta Air Lines', amount: 412.0, date: '2026-07-09', category: 'Travel', status: 'completed' },
  { id: 'txn-9', accountId: 'acct-checking', merchant: 'Georgia Power', amount: 89.44, date: '2026-07-08', category: 'Utilities', status: 'completed' },
  { id: 'txn-10', accountId: 'acct-checking', merchant: 'Refund - Best Buy', amount: -34.99, date: '2026-07-07', category: 'Shopping', status: 'completed' },
  { id: 'txn-11', accountId: 'acct-credit', merchant: 'Netflix', amount: 15.49, date: '2026-06-14', category: 'Subscriptions', status: 'completed' },
  { id: 'txn-12', accountId: 'acct-credit', merchant: 'Spotify', amount: 11.99, date: '2026-06-11', category: 'Subscriptions', status: 'completed' },
  { id: 'txn-13', accountId: 'acct-credit', merchant: 'Netflix', amount: 15.49, date: '2026-05-14', category: 'Subscriptions', status: 'completed' },
  { id: 'txn-14', accountId: 'acct-credit', merchant: 'Spotify', amount: 11.99, date: '2026-05-11', category: 'Subscriptions', status: 'completed' },
];
