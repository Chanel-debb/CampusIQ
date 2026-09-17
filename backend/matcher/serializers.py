from rest_framework import serializers

from careers.serializers import CareerListSerializer
from universities.serializers import ProgramSerializer

from .models import MatchResult


class MatchRunSerializer(serializers.Serializer):
    quiz_answers = serializers.DictField()
    session_key = serializers.CharField(max_length=64, required=False, allow_blank=True)

    def validate_quiz_answers(self, value):
        if not value:
            raise serializers.ValidationError("quiz_answers cannot be empty.")
        return value


class MatchResultSerializer(serializers.ModelSerializer):
    """Renders a MatchResult using explicitly ranked careers/programs passed via context.

    We don't read `instance.recommended_careers.all()` directly: Career's default
    ordering is alphabetical by title, which would silently discard match-score rank.
    The view always computes (or recomputes, for GET) the ranked lists via engine.run_matcher
    and passes them in as context["careers"] / context["programs"].
    """

    recommended_careers = serializers.SerializerMethodField()
    recommended_programs = serializers.SerializerMethodField()

    class Meta:
        model = MatchResult
        fields = [
            "id",
            "session_key",
            "quiz_answers",
            "recommended_careers",
            "recommended_programs",
            "created_at",
        ]

    def get_recommended_careers(self, obj):
        careers = self.context.get("careers", [])
        return CareerListSerializer(careers, many=True).data

    def get_recommended_programs(self, obj):
        programs = self.context.get("programs", [])
        return ProgramSerializer(programs, many=True).data
