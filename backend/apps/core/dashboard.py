from django.db.models import Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.news.models import NewsArticle, Notice
from apps.gallery.models import Photo
from apps.admissions.models import Enquiry
from apps.contact.models import ContactSubmission


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    now = timezone.now()
    return Response({
        'total_news': NewsArticle.objects.count(),
        'total_gallery_photos': Photo.objects.count(),
        'total_admissions': Enquiry.objects.count(),
        'pending_admissions': Enquiry.objects.filter(status='unread').count(),
        'total_messages': ContactSubmission.objects.count(),
        'unread_messages': ContactSubmission.objects.filter(is_read=False).count(),
        'active_notices': Notice.objects.filter(is_active=True).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gte=now)
        ).count(),
    })
