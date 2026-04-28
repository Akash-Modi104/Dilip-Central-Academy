from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import IsStaffOrSuper
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer


class ContactSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffOrSuper()]

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        c = self.get_object()
        c.is_read = True
        c.save()
        return Response(ContactSubmissionSerializer(c).data)
