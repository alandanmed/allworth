from fastapi import FastAPI

from app.config import settings
from app.logging_config import configure_logging
from app.routers import health

configure_logging()

app = FastAPI(title=settings.app_name)

app.include_router(health.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"{settings.app_name} is running"}
