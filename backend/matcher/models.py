import uuid

from django.conf import settings
from django.db import models


class MatchResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="match_results",
    )
    session_key = models.CharField(max_length=64, blank=True, db_index=True)
    quiz_answers = models.JSONField(default=dict)
    recommended_careers = models.ManyToManyField(
        "careers.Career", related_name="match_results", blank=True
    )
    recommended_programs = models.ManyToManyField(
        "universities.Program", related_name="match_results", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"MatchResult({self.user or self.session_key or self.id})"
