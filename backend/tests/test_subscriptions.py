from app.utils.subscriptions import detect_subscriptions


def txn(merchant, amount, date, category="Subscriptions"):
    return {"merchant": merchant, "amount": amount, "date": date, "category": category}


def test_monthly_charge_across_three_months_is_a_subscription():
    result = detect_subscriptions([
        txn("Netflix", 15.49, "2026-08-14"),
        txn("Netflix", 15.49, "2026-09-14"),
        txn("Netflix", 15.49, "2026-10-03"),
    ])
    assert [s["merchant"] for s in result] == ["Netflix"]
    assert result[0]["latest_amount"] == 15.49
    assert result[0]["occurrences"] == 3


def test_price_increase_is_reported():
    result = detect_subscriptions([
        txn("Spotify", 10.99, "2026-08-11"),
        txn("Spotify", 10.99, "2026-09-11"),
        txn("Spotify", 11.99, "2026-10-06"),
    ])
    assert result[0]["price_changed"] is True
    assert result[0]["previous_amount"] == 10.99


def test_income_is_never_a_subscription():
    result = detect_subscriptions([
        txn("Payroll Deposit", -2100.0, "2026-08-01", "Income"),
        txn("Payroll Deposit", -2100.0, "2026-09-01", "Income"),
        txn("Payroll Deposit", -2100.0, "2026-10-01", "Income"),
    ])
    assert result == []


def test_regular_store_seen_in_only_two_months_is_not_a_subscription():
    result = detect_subscriptions([
        txn("Trader Joe's", 58.20, "2026-09-15", "Groceries"),
        txn("Trader Joe's", 64.32, "2026-10-02", "Groceries"),
    ])
    assert result == []


def test_several_visits_in_one_month_is_not_a_subscription():
    result = detect_subscriptions([
        txn("Chipotle", 13.75, "2026-10-02", "Dining"),
        txn("Chipotle", 13.75, "2026-10-09", "Dining"),
        txn("Chipotle", 13.75, "2026-10-16", "Dining"),
    ])
    assert result == []
