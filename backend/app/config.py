from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AllWorth API"
    environment: str = "development"
    debug: bool = True
    database_url: str
    test_database_url: str
    firebase_service_account_path: str
    anthropic_api_key: str
    plaid_client_id: str
    plaid_secret: str
    plaid_env: str = "sandbox"
    token_encryption_key: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
