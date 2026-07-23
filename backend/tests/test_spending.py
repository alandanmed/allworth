from decimal import Decimal

from app.utils.spending import calculate_percent_change, month_bounds, previous_month


def test_month_bounds_handles_leap_february():
    start, end = month_bounds(2028, 2)
    assert start.day == 1
    assert end.day == 29  # 2028 is a leap year


def test_previous_month_wraps_year_boundary():
    assert previous_month(2026, 1) == (2025, 12)


def test_percent_change_avoids_division_by_zero():
    assert calculate_percent_change(Decimal("100"), Decimal("0")) is None


def test_percent_change_calculates_increase():
    assert calculate_percent_change(Decimal("110"), Decimal("100")) == 10.0
