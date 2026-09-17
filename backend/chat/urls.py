from django.urls import path

from .views import ChatSessionCreateView, ChatSessionDetailView

urlpatterns = [
    path("sessions/", ChatSessionCreateView.as_view(), name="chat-session-create"),
    path(
        "sessions/<str:session_key>/",
        ChatSessionDetailView.as_view(),
        name="chat-session-detail",
    ),
]
