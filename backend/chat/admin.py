from django.contrib import admin

from .models import ChatSession, DocumentChunk, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ["role", "content", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "session_key", "created_at"]
    search_fields = ["session_key", "user__email"]
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "chat_session", "role", "created_at"]
    list_filter = ["role"]


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ["id", "source", "created_at"]
    search_fields = ["source", "content"]
