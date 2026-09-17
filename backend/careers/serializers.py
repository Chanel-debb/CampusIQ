from rest_framework import serializers

from universities.models import Program

from .models import Career, CareerCategory


class CareerCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerCategory
        fields = ["id", "name", "slug"]


class LinkedProgramSerializer(serializers.ModelSerializer):
    """A Program as shown on a Career's detail page — needs the parent university's
    name/slug for context, unlike universities.serializers.ProgramSerializer, which is
    nested under a University detail response where that's already implied."""

    university_name = serializers.CharField(source="university.name", read_only=True)
    university_slug = serializers.CharField(source="university.slug", read_only=True)

    class Meta:
        model = Program
        fields = [
            "id",
            "name",
            "slug",
            "degree_type",
            "university_name",
            "university_slug",
        ]


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
    programs = LinkedProgramSerializer(many=True, read_only=True)

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
            "programs",
            "created_at",
            "updated_at",
        ]
