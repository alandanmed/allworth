from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logging_config import configure_logging
from app.routers import accounts, health, transactions

configure_logging()

app = FastAPI(title=settings.app_name)

# Dev-only: wide open so the Expo app (simulator, web, or Expo Go) can always reach the API.
# This MUST be tightened to specific origins before any real deployment (Phase 12).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(accounts.router)
app.include_router(transactions.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"{settings.app_name} is running"}
