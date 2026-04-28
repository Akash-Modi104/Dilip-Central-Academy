from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny

from apps.permissions import ReadOnlyOrSuperAdmin
from .models import SiteSettings, NavLink, SEOMeta
from .serializers import SiteSettingsSerializer, NavLinkSerializer, SEOMetaSerializer


class SiteSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingsSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]

    def get_object(self):
        return SiteSettings.load()


class NavLinkViewSet(viewsets.ModelViewSet):
    queryset = NavLink.objects.all()
    serializer_class = NavLinkSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class SEOMetaViewSet(viewsets.ModelViewSet):
    queryset = SEOMeta.objects.all()
    serializer_class = SEOMetaSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]
    lookup_field = 'page_key'
