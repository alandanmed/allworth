import json

from anthropic import Anthropic
from sqlalchemy.orm import Session

from app.ai import tools
from app.ai.tool_schemas import CLAUDE_TOOLS
from app.config import settings

client = Anthropic(api_key=settings.anthropic_api_key)

TOOL_REGISTRY = {
    "get_net_worth": tools.get_net_worth,
    "get_account_balances": tools.get_account_balances,
    "get_recent_transactions": tools.get_recent_transactions,
    "get_spending_by_category": tools.get_spending_by_category,
    "compare_spending_periods": tools.compare_spending_periods,
    "get_subscriptions": tools.get_subscriptions,
    "find_large_transactions": tools.find_large_transactions,
}

SYSTEM_PROMPT = (
    "You are AllWorth's financial assistant. You answer questions about the "
    "user's own simulated financial data using the tools provided. "
    "You MUST use a tool to look up any real numbers — never guess or make up "
    "financial figures. Keep answers concise and conversational. "
    "This app uses simulated data for demonstration purposes, not real banking "
    "information, and you provide financial information and educational "
    "insights only, never professional financial advice."
)

MODEL = "claude-haiku-4-5-20251001"


def generate_response(
    db: Session, user_id, message: str, history: list[dict] | None = None
) -> tuple[str, list[dict]]:
    """
    Returns (response_text, tool_calls_made) — same contract as the mock
    assistant, so the chat router doesn't need to change at all.
    """
    messages = (history or []) + [{"role": "user", "content": message}]
    tool_calls_made = []

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        tools=CLAUDE_TOOLS,
        messages=messages,
    )

    # Claude may request one or more tool calls before giving a final answer.
    # Loop until it stops asking for tools (hard cap prevents any runaway loop).
    max_tool_rounds = 5
    rounds = 0

    while response.stop_reason == "tool_use" and rounds < max_tool_rounds:
        rounds += 1
        tool_use_blocks = [block for block in response.content if block.type == "tool_use"]

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in tool_use_blocks:
            tool_fn = TOOL_REGISTRY.get(block.name)
            if not tool_fn:
                tool_output = {"error": f"Unknown tool: {block.name}"}
            else:
                tool_output = tool_fn(db, user_id, **block.input)

            tool_calls_made.append(
                {"tool_name": block.name, "tool_input": block.input, "tool_output": tool_output}
            )
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(tool_output),
                }
            )

        messages.append({"role": "user", "content": tool_results})

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=CLAUDE_TOOLS,
            messages=messages,
        )

    final_text = "".join(block.text for block in response.content if block.type == "text")
    return final_text or "I'm not sure how to answer that.", tool_calls_made
