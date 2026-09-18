from pydantic import BaseModel


class UserPreferencesOut(BaseModel):
    daily_summary_enabled: bool


class UserPreferencesUpdate(BaseModel):
    daily_summary_enabled: bool
