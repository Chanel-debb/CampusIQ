import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Conversation, Message
from .services.claude import stream_reply


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        if not self.scope["user"].is_authenticated:
            await self.close(code=4001)
            return
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_content = data.get("message", "").strip()
        if not user_content:
            return

        conversation = await self._get_conversation()
        await self._save_message(conversation, Message.Role.USER, user_content)
        history = await self._get_history(conversation)

        assistant_text = ""
        async for delta in stream_reply(history):
            assistant_text += delta
            await self.send(text_data=json.dumps({"type": "delta", "content": delta}))

        await self._save_message(conversation, Message.Role.ASSISTANT, assistant_text)
        await self.send(text_data=json.dumps({"type": "done"}))

    @database_sync_to_async
    def _get_conversation(self) -> Conversation:
        return Conversation.objects.get(id=self.conversation_id)

    @database_sync_to_async
    def _save_message(self, conversation: Conversation, role: str, content: str) -> None:
        Message.objects.create(conversation=conversation, role=role, content=content)

    @database_sync_to_async
    def _get_history(self, conversation: Conversation) -> list[dict[str, str]]:
        return [
            {"role": m.role, "content": m.content}
            for m in conversation.messages.order_by("created_at")
            if m.role in (Message.Role.USER, Message.Role.ASSISTANT)
        ]
