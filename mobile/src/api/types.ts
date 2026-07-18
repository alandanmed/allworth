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
