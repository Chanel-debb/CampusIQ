from rest_framework import serializers

from .models import Career, CareerCategory


class CareerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCategory
        fields = ["id", "name", "slug"]


class CareerListSerializer(serializers.ModelSerializer):
    category = CareerCategorySerializer(read_only=True)

    class Meta:
        model = Career
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "salary_min",
            "salary_max",
            "job_outlook",
        ]


class CareerDetailSerializer(serializers.ModelSerializer):
    category = CareerCategorySerializer(read_only=True)

    class Meta:
        model = Career
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "description",
            "salary_min",
            "salary_max",
            "job_outlook",
            "required_education",
            "skills",
            "created_at",
            "updated_at",
        ]
