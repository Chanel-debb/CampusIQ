import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

from .models import ChatSession, Message
from .rag import build_context
from .services.claude import stream_reply

_SYSTEM_PROMPT = (
    "You are a helpful assistant for CampusIQ, a career and university discovery "
    "platform for high school students. When relevant context about specific careers "
    "or universities is provided below, use it to ground your answer; otherwise answer "
    "from general knowledge."
)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_key = self.scope["url_route"]["kwargs"]["session_key"]
        self.chat_session = await self._get_or_create_session()
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_content = data.get("message", "").strip()
        if not user_content:
            return

        await self._save_message(Message.Role.USER, user_content)
        history = await self._get_history()
        context = await database_sync_to_async(build_context)(user_content)
        system_prompt = f"{_SYSTEM_PROMPT}\n\n{context}" if context else _SYSTEM_PROMPT

        assistant_text = ""
        async for delta in stream_reply(
            history, system=system_prompt, model=settings.ANTHROPIC_MODEL
        ):
            assistant_text += delta
            await self.send(text_data=json.dumps({"type": "delta", "content": delta}))

        await self._save_message(Message.Role.ASSISTANT, assistant_text)
        await self.send(text_data=json.dumps({"type": "done"}))

    @database_sync_to_async
    def _get_or_create_session(self) -> ChatSession:
        user = self.scope["user"] if self.scope["user"].is_authenticated else None
        session, _created = ChatSession.objects.get_or_create(
            session_key=self.session_key, defaults={"user": user}
        )
        return session

    @database_sync_to_async
    def _save_message(self, role: str, content: str) -> None:
        Message.objects.create(chat_session=self.chat_session, role=role, content=content)

    @database_sync_to_async
    def _get_history(self) -> list[dict[str, str]]:
        return [
            {"role": m.role, "content": m.content}
            for m in self.chat_session.messages.order_by("created_at")
        ]
