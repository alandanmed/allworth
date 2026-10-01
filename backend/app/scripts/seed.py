import os
import uuid
from datetime import date
from decimal import Decimal

from app.database import SessionLocal
from app.models import Account, Category, Institution, NetWorthSnapshot, Transaction, User
from app.utils.spending import month_bounds, previous_month

# Overridable via env var since each environment (local dev, production) has
# its own server-generated user UUID — there's no way to know it in advance.
DEMO_USER_ID = uuid.UUID(os.environ.get("DEMO_USER_ID", "ac2b4903-5eff-44d4-bb27-f786aeab959d"))


def _clamp_day(year: int, month: int, day: int) -> date:
    """Builds year-month-day, clamping day to the last valid day of that month
    (and never later than today, for the current month) so dates stay valid
    and never land in the future no matter which day of the month this seed
    script is run on."""
    last_day = month_bounds(year, month)[1].day
    today = date.today()
    if year == today.year and month == today.month:
        last_day = min(last_day, today.day)
    return date(year, month, min(day, last_day))


def seed() -> None:
    db = SessionLocal()
    today = date.today()
    this_month_year, this_month_month = today.year, today.month
    last_month_year, last_month_month = previous_month(this_month_year, this_month_month)
    two_months_back_year, two_months_back_month = previous_month(last_month_year, last_month_month)

    def d(months_back: int, day: int) -> date:
        """months_back=0 is the current month, 1 is last month, 2 is two months back."""
        year, month = this_month_year, this_month_month
        for _ in range(months_back):
            year, month = previous_month(year, month)
        return _clamp_day(year, month, day)

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
                # --- Current month to date (dates clamp to not exceed today,
                # so this stays realistic whether seeded on day 1 or day 28) ---
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Income"].id,
                            merchant="Payroll Deposit", amount=Decimal("-2100.00"), date=str(d(0, 1)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Groceries"].id,
                            merchant="Trader Joe's", amount=Decimal("64.32"), date=str(d(0, 2)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Netflix", amount=Decimal("15.49"), date=str(d(0, 3)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Transportation"].id,
                            merchant="Shell Gas Station", amount=Decimal("42.10"), date=str(d(0, 4)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Shopping"].id,
                            merchant="Amazon", amount=Decimal("128.90"), date=str(d(0, 5)), status="pending"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Spotify", amount=Decimal("11.99"), date=str(d(0, 6)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Dining"].id,
                            merchant="Chipotle", amount=Decimal("13.75"), date=str(d(0, 7)), status="completed"),

                # --- Last month — a full, realistic calendar month, so month-to-month
                # comparisons produce sensible percentages instead of misleading spikes ---
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Income"].id,
                            merchant="Payroll Deposit", amount=Decimal("-2100.00"), date=str(d(1, 1)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Groceries"].id,
                            merchant="Trader Joe's", amount=Decimal("58.20"), date=str(d(1, 15)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Transportation"].id,
                            merchant="Shell Gas Station", amount=Decimal("39.50"), date=str(d(1, 14)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Dining"].id,
                            merchant="Chipotle", amount=Decimal("12.90"), date=str(d(1, 10)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Dining"].id,
                            merchant="Chipotle", amount=Decimal("13.75"), date=str(d(1, 11)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Shopping"].id,
                            merchant="Amazon", amount=Decimal("95.40"), date=str(d(1, 8)), status="completed"),
                Transaction(account_id=accounts["checking"].id, category_id=categories_by_name["Utilities"].id,
                            merchant="Georgia Power", amount=Decimal("84.10"), date=str(d(1, 7)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Travel"].id,
                            merchant="Delta Air Lines", amount=Decimal("412.00"), date=str(d(1, 9)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Netflix", amount=Decimal("15.49"), date=str(d(1, 14)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Spotify", amount=Decimal("11.99"), date=str(d(1, 11)), status="completed"),

                # --- Two months back — just enough for subscription recurring detection ---
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Netflix", amount=Decimal("15.49"), date=str(d(2, 14)), status="completed"),
                Transaction(account_id=accounts["credit"].id, category_id=categories_by_name["Subscriptions"].id,
                            merchant="Spotify", amount=Decimal("11.99"), date=str(d(2, 11)), status="completed"),
            ]
            db.add_all(transactions)
            db.commit()
            print(f"Seeded 5 accounts and {len(transactions)} transactions for {user.email}.")
        else:
            print("This user already has accounts — skipping account/transaction seed.")

        # --- Historical net worth snapshots: 5 months before the current one,
        # each dated the first of its month, ending right before this month ---
        if not db.query(NetWorthSnapshot).filter(NetWorthSnapshot.user_id == user.id).first():
            base_net_worth = Decimal("11820.30")
            step = Decimal("450.00")
            year, month = this_month_year, this_month_month
            months_ago = []
            for _ in range(5):
                year, month = previous_month(year, month)
                months_ago.append((year, month))
            months_ago.reverse()  # oldest first

            for index, (year, month) in enumerate(months_ago):
                net_worth = base_net_worth + step * index
                db.add(NetWorthSnapshot(
                    user_id=user.id,
                    date=date(year, month, 1),
                    net_worth=net_worth,
                    total_assets=net_worth + Decimal("10000.00"),
                    total_liabilities=Decimal("10000.00"),
                ))
            db.commit()
            print(f"Seeded {len(months_ago)} historical net worth snapshots.")
        else:
            print("Net worth snapshots already exist — skipping.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
