"""
Mock assistant: simple keyword matching instead of a real LLM.
This exists purely to prove the chat pipeline (tool selection, execution,
logging, response formatting) works correctly before wiring up real Claude
API calls and incurring any cost.
"""

from sqlalchemy.orm import Session

from app.ai import tools

TOOL_REGISTRY = {
    "net_worth": tools.get_net_worth,
    "account_balances": tools.get_account_balances,
    "recent_transactions": tools.get_recent_transactions,
    "spending_by_category": tools.get_spending_by_category,
    "compare_spending": tools.compare_spending_periods,
    "subscriptions": tools.get_subscriptions,
    "large_transactions": tools.find_large_transactions,
}


def _select_tool(message: str) -> str | None:
    lowered = message.lower()
    if "net worth" in lowered:
        return "net_worth"
    if "balance" in lowered or "account" in lowered:
        return "account_balances"
    if "subscription" in lowered:
        return "subscriptions"
    if "compare" in lowered or "last month" in lowered or "vs" in lowered:
        return "compare_spending"
    if "spend" in lowered or "spent" in lowered or "category" in lowered:
        return "spending_by_category"
    if "large" in lowered or "biggest" in lowered:
        return "large_transactions"
    if "transaction" in lowered or "recent" in lowered:
        return "recent_transactions"
    return None


def _format_response(tool_name: str, result: dict) -> str:
    if tool_name == "net_worth":
        return (
            f"Your current net worth is ${result['net_worth']:,.2f} "
            f"(${result['total_assets']:,.2f} in assets, ${result['total_liabilities']:,.2f} in liabilities)."
        )
    if tool_name == "account_balances":
        lines = [f"{a['name']}: ${a['balance']:,.2f}" for a in result["accounts"]]
        return "Here are your account balances:\n" + "\n".join(lines)
    if tool_name == "recent_transactions":
        lines = [f"{t['merchant']}: ${t['amount']:,.2f} ({t['date']})" for t in result["transactions"][:5]]
        return "Here are your recent transactions:\n" + "\n".join(lines)
    if tool_name == "spending_by_category":
        lines = [f"{c['category']}: ${c['total']:,.2f}" for c in result["by_category"]]
        return f"Spending by category for {result['month']}:\n" + "\n".join(lines)
    if tool_name == "compare_spending":
        direction = "more" if result["dollar_difference"] > 0 else "less"
        return (
            f"You spent ${abs(result['dollar_difference']):,.2f} {direction} in "
            f"{result['current_month']} (${result['current_month_total']:,.2f}) "
            f"compared to the previous month (${result['previous_month_total']:,.2f})."
        )
    if tool_name == "subscriptions":
        if not result["subscriptions"]:
            return "I didn't find any recurring subscriptions."
        lines = [f"{s['merchant']}: ${s['latest_amount']:,.2f}/mo" for s in result["subscriptions"]]
        return "Here are your detected subscriptions:\n" + "\n".join(lines)
    if tool_name == "large_transactions":
        lines = [f"{t['merchant']}: ${t['amount']:,.2f} ({t['date']})" for t in result["transactions"]]
        return "Here are your largest recent transactions:\n" + "\n".join(lines)
    return "I'm not sure how to answer that yet."


def generate_response(db: Session, user_id, message: str) -> tuple[str, list[dict]]:
    """
    Returns (response_text, tool_calls_made) where tool_calls_made is a list of
    {"tool_name": ..., "tool_input": ..., "tool_output": ...} for logging.
    """
    tool_name = _select_tool(message)

    if tool_name is None:
        return (
            "I can help with net worth, account balances, recent transactions, "
            "spending by category, spending comparisons, subscriptions, and large transactions. "
            "Try asking about one of those!",
            [],
        )

    tool_fn = TOOL_REGISTRY[tool_name]
    result = tool_fn(db, user_id)
    response_text = _format_response(tool_name, result)

    tool_call_log = {"tool_name": tool_name, "tool_input": {}, "tool_output": result}
    return response_text, [tool_call_log]
