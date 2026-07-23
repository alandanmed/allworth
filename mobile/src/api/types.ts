// Raw shapes exactly as the FastAPI backend returns them (snake_case, matching Python).
// These get transformed into the app's own camelCase domain types in the hooks below —
// the rest of the app should never import from this file directly.

export type ApiInstitution = {
  id: string;
  name: string;
  logo_color: string | null;
};

export type ApiCategory = {
  id: string;
  name: string;
};

export type ApiAccount = {
  id: string;
  name: string;
  type: string;
  balance: number;
  last_four_digits: string;
  sync_status: string;
  institution: ApiInstitution;
  created_at: string;
};

export type ApiTransaction = {
  id: string;
  account_id: string;
  merchant: string;
  amount: number;
  date: string;
  status: string;
  notes: string | null;
  category: ApiCategory | null;
  created_at: string;
};

export type ApiNetWorthSnapshot = {
  id: string;
  date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
};

export type ApiSpendingByCategory = {
  category: string;
  total: number;
};

export type ApiSpendingSummary = {
  month: string;
  total_spent: number;
  previous_month_total_spent: number;
  percent_change: number | null;
  by_category: ApiSpendingByCategory[];
};
