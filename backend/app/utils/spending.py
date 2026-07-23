from calendar import monthrange
from datetime import date
from decimal import Decimal


def month_bounds(year: int, month: int) -> tuple[date, date]:
    """Returns (first_day, last_day) for the given year/month, inclusive."""
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def previous_month(year: int, month: int) -> tuple[int, int]:
    if month == 1:
        return year - 1, 12
    return year, month - 1


def calculate_percent_change(current: Decimal, previous: Decimal) -> float | None:
    if previous == 0:
        return None  # undefined — avoid dividing by zero
    change = (current - previous) / previous * Decimal("100")
    return round(float(change), 1)
