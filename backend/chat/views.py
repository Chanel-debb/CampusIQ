from rest_framework import generics, permissions

from .models import ChatSession
from .serializers import ChatSessionDetailSerializer, ChatSessionSerializer


class ChatSessionCreateView(generics.CreateAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class ChatSessionDetailView(generics.RetrieveAPIView):
    queryset = ChatSession.objects.prefetch_related("messages")
    serializer_class = ChatSessionDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "session_key"
