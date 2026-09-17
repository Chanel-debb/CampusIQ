import uuid

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .engine import run_matcher
from .models import MatchResult
from .questions import QUESTIONS
from .serializers import MatchResultSerializer, MatchRunSerializer


class QuestionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(QUESTIONS)


class MatchRunView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = MatchRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz_answers = serializer.validated_data["quiz_answers"]
        session_key = serializer.validated_data.get("session_key", "")

        user = request.user if request.user.is_authenticated else None
        if user is None and not session_key:
            session_key = uuid.uuid4().hex

        result = run_matcher(quiz_answers)

        match_result = MatchResult.objects.create(
            user=user, session_key=session_key, quiz_answers=quiz_answers
        )
        match_result.recommended_careers.set(result["careers"])
        match_result.recommended_programs.set(result["programs"])

        output = MatchResultSerializer(
            match_result,
            context={"careers": result["careers"], "programs": result["programs"]},
        )
        return Response(output.data, status=status.HTTP_201_CREATED)


class MatchResultDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, session_key):
        match_result = (
            MatchResult.objects.filter(session_key=session_key).order_by("-created_at").first()
        )
        if match_result is None:
            return Response(
                {"detail": "No match result found for this session."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = run_matcher(match_result.quiz_answers)
        output = MatchResultSerializer(
            match_result,
            context={"careers": result["careers"], "programs": result["programs"]},
        )
        return Response(output.data)
