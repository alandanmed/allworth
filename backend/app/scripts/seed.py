import uuid
from datetime import date
from decimal import Decimal

from app.database import SessionLocal
from app.models import Account, Category, Institution, NetWorthSnapshot, Transaction, User

DEMO_USER_ID = uuid.UUID("58f133da-f42a-4bca-8442-c40eabcaaaee")

HISTORICAL_SNAPSHOTS = [
    {"date": date(2026, 2, 1), "net_worth": Decimal("11820.30")},
    {"date": date(2026, 3, 1), "net_worth": Decimal("12140.75")},
    {"date": date(2026, 4, 1), "net_worth": Decimal("12680.10")},
    {"date": date(2026, 5, 1), "net_worth": Decimal("13205.55")},
    {"date": date(2026, 6, 1), "net_worth": Decimal("13640.90")},
]


def seed() -> None:
    db = SessionLocal()

    try:
        # --- Reference data ---
        if not db.query(Institution).first():
            institutions = [
                Institution(name="Northwind Bank", logo_color="#2563EB"),
                Institution(name="Horizon Credit Union", logo_color="#DC2626"),
                Institution(name="Vantage Investments", logo_color="#16A34A"),
            ]
            db.add_all(institutions)

            category_names = [
                "Groceries", "Subscriptions", "Transportation", "Shopping",
                "Income", "Dining", "Travel", "Utilities",
            ]
            categories = [Category(name=name) for name in category_names]
            db.add_all(categories)
            db.commit()
            print(f"Seeded {len(institutions)} institutions and {len(categories)} categories.")
        else:
            print("Reference data already exists — skipping.")

        institutions_by_name = {i.name: i for i in db.query(Institution).all()}
        categories_by_name = {c.name: c for c in db.query(Category).all()}

        # --- Demo accounts/transactions for the real logged-in user ---
        user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if not user:
            print(f"No user found with id {DEMO_USER_ID} — log in through the app first, then rerun this.")
            return

        if not db.query(Account).filter(Account.user_id == user.id).first():
            accounts = {
                "checking": Account(
                    user_id=user.id, institution_id=institutions_by_name["Northwind Bank"].id,
                    name="Everyday Checking", type="checking",
                    balance=Decimal("3245.67"), last_four_digits="4821", sync_status="manual",
                ),
                "savings": Account(
                    user_id=user.id, institution_id=institutions_by_name["Northwind Bank"].id,
                    name="High-Yield Savings", type="savings",
                    balance=Decimal("12500.00"), last_four_digits="9034", sync_status="manual",
                ),
                "credit": Account(
                    user_id=user.id, institution_id=institutions_by_name["Horizon Credit Union"].id,
                    name="Rewards Credit Card", type="credit_card",
                    balance=Decimal("842.15"), last_four_digits="2210", sync_status="manual",
                ),
                "investment": Account(
                    user_id=user.id, institution_id=institutions_by_name["Vantage Investments"].id,
                    name="Brokerage Account", type="investment",
                    balance=Decimal("8720.42"), last_four_digits="7765", sync_status="manual",
                ),
                "loan": Account(
                    user_id=user.id, institution_id=institutions_by_name["Horizon Credit Union"].id,
                    name="Auto Loan", type="loan",
                    balance=Decimal("9350.00"), last_four_digits="5540", sync_status="manual",
                ),
            }
            db.add_all(accounts.values())
            db.flush()

            transactions = [
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Groceries"].id,
                            merchant="Trader Joe's", amount=Decimal("64.32"), date="2026-07-15", status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Netflix", amount=Decimal("15.49"), date="2026-07-14", status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Transportation"].id,
                            merchant="Shell Gas Station", amount=Decimal("42.10"), date="2026-07-14", status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Shopping"].id,
                            merchant="Amazon", amount=Decimal("128.90"), date="2026-07-13", status="pending"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Income"].id,
                            merchant="Payroll Deposit", amount=Decimal("-2100.00"), date="2026-07-12", status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Spotify", amount=Decimal("11.99"), date="2026-07-11", status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Dining"].id,
                            merchant="Chipotle", amount=Decimal("13.75"), date="2026-07-10", status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Dining"].id,
                            merchant="Chipotle", amount=Decimal("13.75"), date="2026-07-11", status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Travel"].id,
                            merchant="Delta Air Lines", amount=Decimal("412.00"), date="2026-07-09", status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Utilities"].id,
                            merchant="Georgia Power", amount=Decimal("89.44"), date="2026-07-08", status="completed"),
            ]
            db.add_all(transactions)
            db.commit()
            print(f"Seeded 5 accounts and {len(transactions)} transactions for {user.email}.")
        else:
            print("This user already has accounts — skipping account/transaction seed.")

        # --- Historical net worth snapshots ---
        if not db.query(NetWorthSnapshot).filter(NetWorthSnapshot.user_id == user.id).first():
            for snap in HISTORICAL_SNAPSHOTS:
                # Approximate historical assets/liabilities split for realism;
                # only net_worth is used by the chart today.
                db.add(NetWorthSnapshot(
                    user_id=user.id,
                    date=snap["date"],
                    net_worth=snap["net_worth"],
                    total_assets=snap["net_worth"] + Decimal("10000.00"),
                    total_liabilities=Decimal("10000.00"),
                ))
            db.commit()
            print(f"Seeded {len(HISTORICAL_SNAPSHOTS)} historical net worth snapshots.")
        else:
            print("Net worth snapshots already exist — skipping.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
