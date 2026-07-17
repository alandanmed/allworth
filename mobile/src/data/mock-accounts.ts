import { Account } from '@/types/finance';

export const mockAccounts: Account[] = [
  {
    id: 'acct-checking',
    institutionId: 'inst-1',
    name: 'Everyday Checking',
    type: 'checking',
    balance: 3245.67,
    lastFourDigits: '4821',
    syncStatus: 'manual',
  },
  {
    id: 'acct-savings',
    institutionId: 'inst-1',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 12500.0,
    lastFourDigits: '9034',
    syncStatus: 'manual',
  },
  {
    id: 'acct-credit',
    institutionId: 'inst-2',
    name: 'Rewards Credit Card',
    type: 'credit_card',
    balance: 842.15,
    lastFourDigits: '2210',
    syncStatus: 'manual',
  },
  {
    id: 'acct-investment',
    institutionId: 'inst-3',
    name: 'Brokerage Account',
    type: 'investment',
    balance: 8720.42,
    lastFourDigits: '7765',
    syncStatus: 'manual',
  },
  {
    id: 'acct-loan',
    institutionId: 'inst-2',
    name: 'Auto Loan',
    type: 'loan',
    balance: 9350.0,
    lastFourDigits: '5540',
    syncStatus: 'manual',
  },
];
