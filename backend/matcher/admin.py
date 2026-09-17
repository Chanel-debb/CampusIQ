from django.contrib import admin

from .models import MatchResult


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "session_key", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["session_key", "user__email"]
    readonly_fields = ["quiz_answers", "created_at"]
    filter_horizontal = ["recommended_careers", "recommended_programs"]
