from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Account

LIABILITY_ACCOUNT_TYPES = {"credit_card", "loan"}


def calculate_totals(db: Session, user_id) -> dict[str, Decimal]:
    accounts = db.query(Account).filter(Account.user_id == user_id).all()

    total_assets = sum(
        (a.balance for a in accounts if a.type not in LIABILITY_ACCOUNT_TYPES), Decimal("0")
    )
    total_liabilities = sum(
        (a.balance for a in accounts if a.type in LIABILITY_ACCOUNT_TYPES), Decimal("0")
    )

    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": total_assets - total_liabilities,
    }
