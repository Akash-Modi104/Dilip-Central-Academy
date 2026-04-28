from rest_framework import viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied

from apps.permissions import ReadOnlyOrSuperAdmin
from .models import FacultyProfile, CoreValue, PrincipalMessage, AboutContent
from .serializers import (FacultyProfileSerializer, CoreValueSerializer,
                          PrincipalMessageSerializer, AboutContentSerializer)


class FacultyProfileViewSet(viewsets.ModelViewSet):
    queryset = FacultyProfile.objects.all()
    serializer_class = FacultyProfileSerializer

    def get_permissions(self):
        from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
        if self.request.method in SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAuthenticated()]

    def perform_update(self, serializer):
        u = self.request.user
        instance = self.get_object()
        if u.role == 'teacher' and instance.user_id != u.id:
            raise PermissionDenied('Teachers can only edit their own profile.')
        if u.role not in ('super_admin', 'teacher'):
            raise PermissionDenied('Insufficient permissions.')
        serializer.save()

    def perform_create(self, serializer):
        if self.request.user.role != 'super_admin':
            raise PermissionDenied('Only super admins can create faculty profiles.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'super_admin':
            raise PermissionDenied('Only super admins can delete faculty profiles.')
        instance.delete()


class CoreValueViewSet(viewsets.ModelViewSet):
    queryset = CoreValue.objects.all()
    serializer_class = CoreValueSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class PrincipalMessageView(generics.RetrieveUpdateAPIView):
    serializer_class = PrincipalMessageSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]

    def get_object(self):
        return PrincipalMessage.load()


class AboutContentView(generics.RetrieveUpdateAPIView):
    serializer_class = AboutContentSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]

    def get_object(self):
        return AboutContent.load()
