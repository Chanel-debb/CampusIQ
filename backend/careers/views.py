from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Career
from .serializers import CareerDetailSerializer, CareerListSerializer


class CareerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Career.objects.select_related("category").prefetch_related(
        "programs__university"
    )
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return CareerListSerializer
        return CareerDetailSerializer
