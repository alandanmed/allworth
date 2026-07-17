from decimal import Decimal

from passlib.context import CryptContext

from app.database import SessionLocal
from app.models import Account, Category, Institution, Transaction, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed() -> None:
    db = SessionLocal()

    try:
        existing_user = db.query(User).filter(User.email == "alan@example.com").first()
        if existing_user:
            print("Seed data already exists — skipping. Delete the database or rows manually to reseed.")
            return

        user = User(
            email="alan@example.com",
            hashed_password=pwd_context.hash("dev_password_not_for_real_use"),
        )
        db.add(user)
        db.flush()  # assigns user.id without fully committing yet

        institutions = {
            "northwind": Institution(name="Northwind Bank", logo_color="#2563EB"),
            "horizon": Institution(name="Horizon Credit Union", logo_color="#DC2626"),
            "vantage": Institution(name="Vantage Investments", logo_color="#16A34A"),
        }
        db.add_all(institutions.values())
        db.flush()

        category_names = [
            "Groceries", "Subscriptions", "Transportation", "Shopping",
            "Income", "Dining", "Travel", "Utilities",
        ]
        categories = {name: Category(name=name) for name in category_names}
        db.add_all(categories.values())
        db.flush()

        accounts = {
            "checking": Account(
                user_id=user.id,
                institution_id=institutions["northwind"].id,
                name="Everyday Checking",
                type="checking",
                balance=Decimal("3245.67"),
                last_four_digits="4821",
                sync_status="manual",
            ),
            "savings": Account(
                user_id=user.id,
                institution_id=institutions["northwind"].id,
                name="High-Yield Savings",
                type="savings",
                balance=Decimal("12500.00"),
                last_four_digits="9034",
                sync_status="manual",
            ),
            "credit": Account(
                user_id=user.id,
                institution_id=institutions["horizon"].id,
                name="Rewards Credit Card",
                type="credit_card",
                balance=Decimal("842.15"),
                last_four_digits="2210",
                sync_status="manual",
            ),
            "investment": Account(
                user_id=user.id,
                institution_id=institutions["vantage"].id,
                name="Brokerage Account",
                type="investment",
                balance=Decimal("8720.42"),
                last_four_digits="7765",
                sync_status="manual",
            ),
            "loan": Account(
                user_id=user.id,
                institution_id=institutions["horizon"].id,
                name="Auto Loan",
                type="loan",
                balance=Decimal("9350.00"),
                last_four_digits="5540",
                sync_status="manual",
            ),
        }
        db.add_all(accounts.values())
        db.flush()

        transactions = [
            Transaction(account_id=accounts["checking"].id, category_id=categories["Groceries"].id,
                        merchant="Trader Joe's", amount=Decimal("64.32"), date="2026-07-15", status="completed"),
            Transaction(account_id=accounts["credit"].id, category_id=categories["Subscriptions"].id,
                        merchant="Netflix", amount=Decimal("15.49"), date="2026-07-14", status="completed"),
            Transaction(account_id=accounts["checking"].id, category_id=categories["Transportation"].id,
                        merchant="Shell Gas Station", amount=Decimal("42.10"), date="2026-07-14", status="completed"),
            Transaction(account_id=accounts["credit"].id, category_id=categories["Shopping"].id,
                        merchant="Amazon", amount=Decimal("128.90"), date="2026-07-13", status="pending"),
            Transaction(account_id=accounts["checking"].id, category_id=categories["Income"].id,
                        merchant="Payroll Deposit", amount=Decimal("-2100.00"), date="2026-07-12", status="completed"),
            Transaction(account_id=accounts["credit"].id, category_id=categories["Subscriptions"].id,
                        merchant="Spotify", amount=Decimal("11.99"), date="2026-07-11", status="completed"),
            Transaction(account_id=accounts["checking"].id, category_id=categories["Dining"].id,
                        merchant="Chipotle", amount=Decimal("13.75"), date="2026-07-10", status="completed"),
            Transaction(account_id=accounts["checking"].id, category_id=categories["Dining"].id,
                        merchant="Chipotle", amount=Decimal("13.75"), date="2026-07-11", status="completed"),
            Transaction(account_id=accounts["credit"].id, category_id=categories["Travel"].id,
                        merchant="Delta Air Lines", amount=Decimal("412.00"), date="2026-07-09", status="completed"),
            Transaction(account_id=accounts["checking"].id, category_id=categories["Utilities"].id,
                        merchant="Georgia Power", amount=Decimal("89.44"), date="2026-07-08", status="completed"),
        ]
        db.add_all(transactions)

        db.commit()
        print(f"Seeded 1 user, {len(institutions)} institutions, {len(categories)} categories, "
              f"{len(accounts)} accounts, {len(transactions)} transactions.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
