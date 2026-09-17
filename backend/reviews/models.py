import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    university = models.ForeignKey(
        "universities.University", on_delete=models.CASCADE, related_name="reviews"
    )
    program = models.ForeignKey(
        "universities.Program",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )
    overall_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    teaching_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    career_support_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    body = models.TextField()
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("user", "university")]

    def __str__(self):
        return f"{self.user} -> {self.university} ({self.overall_rating}/5)"
