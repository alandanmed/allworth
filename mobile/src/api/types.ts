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

export type ApiBudget = {
  id: string;
  category: ApiCategory;
  monthly_limit: number;
  spent_this_month: number;
  remaining: number;
  percent_used: number;
  is_over_budget: boolean;
};

export type ApiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type ApiChatResponse = {
  conversation_id: string;
  message: ApiChatMessage;
};

export type ApiChatConversationSummary = {
  id: string;
  created_at: string;
  preview: string;
};

export type ApiDailySummary = {
  id: string;
  date: string;
  total_spent: number;
  total_income: number;
  by_category: { category: string; total: number }[];
  daily_average: number;
  percent_vs_average: number | null;
  unusual_transactions: { merchant: string; amount: number; category: string }[];
  budget_warnings: { category: string; percent_used: number; is_over_budget: boolean }[];
};

export type ApiUserPreferences = {
  daily_summary_enabled: boolean;
};

export type ApiBankConnection = {
  id: string;
  institution_name: string;
  status: string;
  accounts_synced: number;
};

export type ApiSyncResult = {
  accounts_synced: number;
  transactions_added: number;
  transactions_skipped_duplicate: number;
};
