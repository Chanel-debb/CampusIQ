from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/chat/(?P<session_key>[0-9a-zA-Z_-]+)/$",
        consumers.ChatConsumer.as_asgi(),
    ),
]
