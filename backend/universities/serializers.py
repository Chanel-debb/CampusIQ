from rest_framework import serializers

from .models import Program, University


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = [
            "id",
            "name",
            "slug",
            "degree_type",
            "duration_years",
            "tuition_domestic",
            "tuition_intl",
            "avg_gpa_required",
        ]


class UniversityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "slug",
            "province",
            "city",
            "avg_rating",
            "total_reviews",
            "ranking_national",
        ]


class UniversityDetailSerializer(serializers.ModelSerializer):
    programs = ProgramSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = [
            "id",
            "name",
            "slug",
            "province",
            "city",
            "website",
            "logo_url",
            "avg_rating",
            "total_reviews",
            "ranking_national",
            "programs",
            "created_at",
            "updated_at",
        ]
