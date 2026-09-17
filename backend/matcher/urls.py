from django.urls import path

from .views import MatchResultDetailView, MatchRunView, QuestionListView

urlpatterns = [
    path("matcher/questions/", QuestionListView.as_view(), name="matcher-questions"),
    path("matcher/run/", MatchRunView.as_view(), name="matcher-run"),
    path(
        "matcher/results/<str:session_key>/",
        MatchResultDetailView.as_view(),
        name="matcher-result-detail",
    ),
]
