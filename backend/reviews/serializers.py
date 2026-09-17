from rest_framework import serializers

from accounts.models import User

from .models import Review


class ReviewAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name"]


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            "id",
            "university",
            "program",
            "overall_rating",
            "teaching_rating",
            "career_support_rating",
            "body",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):
        university = attrs.get("university")
        program = attrs.get("program")

        if program and university and program.university_id != university.id:
            raise serializers.ValidationError(
                {"program": "This program does not belong to the selected university."}
            )

        request = self.context.get("request")
        if request and university:
            already_reviewed = Review.objects.filter(
                user=request.user, university=university
            ).exists()
            if already_reviewed:
                raise serializers.ValidationError(
                    {"university": "You have already submitted a review for this university."}
                )

        return attrs


class ReviewListSerializer(serializers.ModelSerializer):
    user = ReviewAuthorSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "program",
            "overall_rating",
            "teaching_rating",
            "career_support_rating",
            "body",
            "is_verified",
            "created_at",
        ]
