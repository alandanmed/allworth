import uuid

from pydantic import BaseModel


class ConnectSandboxBankRequest(BaseModel):
    institution_id: str = "ins_109508"  # Plaid's default Sandbox test institution ("First Platypus Bank")
    institution_name: str = "First Platypus Bank"


class BankConnectionOut(BaseModel):
    id: uuid.UUID
    institution_name: str
    status: str
    accounts_synced: int


class SyncResultOut(BaseModel):
    accounts_synced: int
    transactions_added: int
    transactions_skipped_duplicate: int
