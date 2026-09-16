import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from core.choices import Province

from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent"
        COUNSELOR = "counselor", "Counselor"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.STUDENT)
    province = models.CharField(max_length=2, choices=Province.choices, blank=True)
    grad_year = models.PositiveSmallIntegerField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
