from django.urls import path
from rest_framework.routers import DefaultRouter

from reviews.views import UniversityReviewListView

from .views import UniversityViewSet

router = DefaultRouter()
router.register("universities", UniversityViewSet, basename="university")

urlpatterns = router.urls + [
    path(
        "universities/<slug:slug>/reviews/",
        UniversityReviewListView.as_view(),
        name="university-reviews",
    ),
]
