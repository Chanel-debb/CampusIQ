import uuid

from django.db import models
from django.utils.text import slugify
from pgvector.django import HnswIndex, VectorField


class CareerCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "career categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Career(models.Model):
    class JobOutlook(models.TextChoices):
        BRIGHT = "bright", "Bright outlook"
        GROWING = "growing", "Growing"
        STABLE = "stable", "Stable"
        DECLINING = "declining", "Declining"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        CareerCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="careers",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    job_outlook = models.CharField(
        max_length=16, choices=JobOutlook.choices, default=JobOutlook.STABLE
    )
    required_education = models.CharField(max_length=255, blank=True)
    skills = models.JSONField(default=list, blank=True)
    embedding = VectorField(dimensions=1536, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        indexes = [
            HnswIndex(
                name="career_embedding_hnsw",
                fields=["embedding"],
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"],
            ),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
