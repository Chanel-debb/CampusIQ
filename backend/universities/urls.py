from rest_framework.routers import DefaultRouter

from .views import UniversityViewSet

router = DefaultRouter()
router.register("universities", UniversityViewSet, basename="university")

urlpatterns = router.urls
