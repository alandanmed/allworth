def detect_subscriptions(transactions: list[dict]) -> list[dict]:
    """
    Groups transactions by merchant, flags recurring ones (2+ occurrences,
    similar amount), and reports the latest amount plus any price change
    versus the prior occurrence. Mirrors the mobile app's detection logic.
    """
    AMOUNT_TOLERANCE_PERCENT = 0.10
    MIN_OCCURRENCES = 2

    by_merchant: dict[str, list[dict]] = {}
    for t in transactions:
        by_merchant.setdefault(t["merchant"], []).append(t)

    def amounts_similar(a: float, b: float) -> bool:
        larger = max(abs(a), abs(b))
        if larger == 0:
            return a == b
        return abs(a - b) / larger <= AMOUNT_TOLERANCE_PERCENT

    subscriptions = []
    for merchant, txns in by_merchant.items():
        if len(txns) < MIN_OCCURRENCES:
            continue

        # Confirm at least MIN_OCCURRENCES have mutually similar amounts —
        # same rule as the mobile-side detector, not just "appeared twice."
        qualifies = False
        for i, t in enumerate(txns):
            matches = [o for o in txns if amounts_similar(t["amount"], o["amount"])]
            if len(matches) >= MIN_OCCURRENCES:
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
