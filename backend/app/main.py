from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logging_config import configure_logging
from app.routers import (
    users,
    accounts,
    analytics,
    budgets,
    categories,
    chat,
    daily_summary,
    health,
    net_worth,
    plaid,
    transactions,
)

configure_logging()

app = FastAPI(title=settings.app_name)

# The only real client is the React Native mobile app, which browsers'
# CORS restrictions don't apply to at all. The wildcard is kept for local
# dev convenience (e.g. testing against `expo start --web`) and closed in
# production, where there is no legitimate browser-based client.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.environment == "development" else [],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(net_worth.router)
app.include_router(analytics.router)
app.include_router(budgets.router)
app.include_router(categories.router)
app.include_router(chat.router)
app.include_router(daily_summary.router)
app.include_router(users.router)
app.include_router(plaid.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"{settings.app_name} is running"}
