def detect_subscriptions(transactions: list[dict]) -> list[dict]:
    """
    Groups transactions by merchant, flags recurring ones (similar amount in
    3+ different calendar months; income/refunds, which are negative, are
    ignored), and reports the latest amount plus any price change
    versus the prior occurrence. Mirrors the mobile app's detection logic.
    """
    AMOUNT_TOLERANCE_PERCENT = 0.10
    MIN_DISTINCT_MONTHS = 3

    by_merchant: dict[str, list[dict]] = {}
    for t in transactions:
        if t["amount"] <= 0:
            continue
        by_merchant.setdefault(t["merchant"], []).append(t)

    def amounts_similar(a: float, b: float) -> bool:
        larger = max(abs(a), abs(b))
        if larger == 0:
            return a == b
        return abs(a - b) / larger <= AMOUNT_TOLERANCE_PERCENT

    subscriptions = []
    for merchant, txns in by_merchant.items():
        if len(txns) < MIN_DISTINCT_MONTHS:
            continue

        # Confirm similar-amount charges span at least MIN_DISTINCT_MONTHS
        # calendar months — same rule as the mobile-side detector.
        qualifies = False
        for t in txns:
            matches = [o for o in txns if amounts_similar(t["amount"], o["amount"])]
            if len({str(o["date"])[:7] for o in matches}) >= MIN_DISTINCT_MONTHS:
                qualifies = True
                break
        if not qualifies:
            continue

        sorted_txns = sorted(txns, key=lambda t: t["date"], reverse=True)
        latest = sorted_txns[0]
        previous = sorted_txns[1] if len(sorted_txns) > 1 else None
        price_changed = previous is not None and abs(latest["amount"] - previous["amount"]) > 0.01

        subscriptions.append({
            "merchant": merchant,
            "category": latest["category"],
            "latest_amount": latest["amount"],
            "previous_amount": previous["amount"] if previous else None,
            "price_changed": price_changed,
            "occurrences": len(sorted_txns),
        })

    return sorted(subscriptions, key=lambda s: s["latest_amount"], reverse=True)
