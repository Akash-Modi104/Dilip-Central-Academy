from django.utils import timezone
from rest_framework import viewsets

from apps.permissions import ReadOnlyOrStaff
from .models import NewsArticle, Event, Notice
from .serializers import NewsArticleSerializer, EventSerializer, NoticeSerializer


class NewsArticleViewSet(viewsets.ModelViewSet):
    serializer_class = NewsArticleSerializer
    permission_classes = [ReadOnlyOrStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        u = self.request.user
        qs = NewsArticle.objects.all()
        if not (u.is_authenticated and u.role in ('super_admin', 'staff')):
            qs = qs.filter(status='published', publish_at__lte=timezone.now())
        return qs


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [ReadOnlyOrStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        u = self.request.user
        qs = Event.objects.all()
        if not (u.is_authenticated and u.role in ('super_admin', 'staff')):
            qs = qs.filter(status='published')
        return qs


class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer
    permission_classes = [ReadOnlyOrStaff]

    def get_queryset(self):
        u = self.request.user
        qs = Notice.objects.all()
        if not (u.is_authenticated and u.role in ('super_admin', 'staff')):
            now = timezone.now()
            qs = qs.filter(is_active=True).exclude(expires_at__lt=now)
        return qs
