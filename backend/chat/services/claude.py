from collections.abc import AsyncIterator

import anthropic
from django.conf import settings


def get_client() -> anthropic.AsyncAnthropic:
    return anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)


async def stream_reply(
    messages: list[dict[str, str]],
    system: str | None = None,
    model: str | None = None,
) -> AsyncIterator[str]:
    """Stream a Claude completion as it is generated, yielding text deltas."""
    client = get_client()
    async with client.messages.stream(
        model=model or settings.ANTHROPIC_MODEL,
        max_tokens=2048,
        system=system or "You are a helpful assistant for CampusIQ.",
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
