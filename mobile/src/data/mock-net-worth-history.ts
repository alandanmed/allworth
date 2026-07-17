export type NetWorthSnapshot = {
  date: string; // ISO date, first of each month
  netWorth: number;
};

export const mockNetWorthHistory: NetWorthSnapshot[] = [
  { date: '2026-02-01', netWorth: 11820.30 },
  { date: '2026-03-01', netWorth: 12140.75 },
  { date: '2026-04-01', netWorth: 12680.10 },
  { date: '2026-05-01', netWorth: 13205.55 },
  { date: '2026-06-01', netWorth: 13640.90 },
  { date: '2026-07-01', netWorth: 14274.94 },
];
