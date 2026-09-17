from rest_framework import generics, permissions

from .models import Review
from .pagination import ReviewPagination
from .serializers import ReviewCreateSerializer, ReviewListSerializer


class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UniversityReviewListView(generics.ListAPIView):
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ReviewPagination

    def get_queryset(self):
        return Review.objects.filter(
            university__slug=self.kwargs["slug"], status=Review.Status.APPROVED
        ).select_related("user", "program")
