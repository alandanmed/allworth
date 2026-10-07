from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AllWorth API"
    environment: str = "development"
    debug: bool = True
    database_url: str
    # Only used by tests/conftest.py for the local test DB — never required
    # in production, which has no reason to run the test suite against itself.
    test_database_url: Optional[str] = None
    firebase_service_account_path: str
    anthropic_api_key: str
    plaid_client_id: str
    plaid_secret: str
    plaid_env: str = "sandbox"
    token_encryption_key: str
    # Comma-separated browser origins allowed to call the API (the web build).
    # Empty in production means no browser client is allowed.
    cors_allowed_origins: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
