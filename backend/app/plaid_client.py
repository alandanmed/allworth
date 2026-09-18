import plaid
from plaid.api import plaid_api

from app.config import settings

_env_map = {
    "sandbox": plaid.Environment.Sandbox,
    "production": plaid.Environment.Production,
}

configuration = plaid.Configuration(
    host=_env_map.get(settings.plaid_env, plaid.Environment.Sandbox),
    api_key={
        "clientId": settings.plaid_client_id,
        "secret": settings.plaid_secret,
    },
)

api_client = plaid.ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)
