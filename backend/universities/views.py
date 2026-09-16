from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .filters import UniversityFilter
from .models import University
from .serializers import UniversityDetailSerializer, UniversityListSerializer


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.prefetch_related("programs").distinct()
    permission_classes = [AllowAny]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend]
    filterset_class = UniversityFilter

    def get_serializer_class(self):
        if self.action == "list":
            return UniversityListSerializer
        return UniversityDetailSerializer
