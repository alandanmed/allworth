"""
Tool definitions in the exact format Claude's Messages API expects.
Each name here must exactly match a key in TOOL_REGISTRY (mock_assistant.py)
or claude_assistant.py's own registry — Claude only ever sees these
descriptions, never the actual Python implementation.
"""

CLAUDE_TOOLS = [
    {
        "name": "get_net_worth",
        "description": "Get the user's current net worth, total assets, and total liabilities.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_account_balances",
        "description": "Get a list of all the user's financial accounts with their name, type, and current balance.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "get_recent_transactions",
        "description": "Get the user's most recent transactions, newest first.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "How many transactions to return, max 50. Defaults to 10.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_spending_by_category",
        "description": "Get total spending broken down by category for a given month.",
        "input_schema": {
            "type": "object",
            "properties": {
                "month": {
                    "type": "string",
                    "description": "Month in YYYY-MM format. Defaults to the current month if not provided.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "compare_spending_periods",
        "description": "Compare total spending for a given month against the previous month.",
        "input_schema": {
            "type": "object",
            "properties": {
                "month": {
                    "type": "string",
                    "description": "Month in YYYY-MM format. Defaults to the current month if not provided.",
                }
            },
            "required": [],
        },
    },
    {
        "name": "get_subscriptions",
        "description": "Get the user's detected recurring subscriptions, including monthly cost and any price changes.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "find_large_transactions",
        "description": "Get the user's largest spending transactions (excludes income/refunds) from the last 90 days.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer",
                    "description": "How many transactions to return, max 20. Defaults to 5.",
                }
            },
            "required": [],
        },
    },
]
