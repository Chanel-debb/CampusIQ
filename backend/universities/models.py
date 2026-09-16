import uuid

from django.db import models
from django.utils.text import slugify


class University(models.Model):
    class Province(models.TextChoices):
        AB = "AB", "Alberta"
        BC = "BC", "British Columbia"
        MB = "MB", "Manitoba"
        NB = "NB", "New Brunswick"
        NL = "NL", "Newfoundland and Labrador"
        NS = "NS", "Nova Scotia"
        NT = "NT", "Northwest Territories"
        NU = "NU", "Nunavut"
        ON = "ON", "Ontario"
        PE = "PE", "Prince Edward Island"
        QC = "QC", "Quebec"
        SK = "SK", "Saskatchewan"
        YT = "YT", "Yukon"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    province = models.CharField(max_length=2, choices=Province.choices)
    city = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    ranking_national = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "universities"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Program(models.Model):
    class DegreeType(models.TextChoices):
        CERTIFICATE = "certificate", "Certificate"
        DIPLOMA = "diploma", "Diploma"
        ASSOCIATE = "associate", "Associate Degree"
        BACHELOR = "bachelor", "Bachelor's Degree"
        MASTER = "master", "Master's Degree"
        DOCTORATE = "doctorate", "Doctorate"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    university = models.ForeignKey(
        University, on_delete=models.CASCADE, related_name="programs"
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    degree_type = models.CharField(max_length=16, choices=DegreeType.choices)
    duration_years = models.DecimalField(max_digits=3, decimal_places=1)
    tuition_domestic = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tuition_intl = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    avg_gpa_required = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    description = models.TextField(blank=True)
    careers = models.ManyToManyField(
        "careers.Career", related_name="programs", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["university__name", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["university", "slug"], name="unique_program_slug_per_university"
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.university.name})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
