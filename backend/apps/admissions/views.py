from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import ReadOnlyOrSuperAdmin, IsStaffOrSuper
from .models import AdmissionStep, FeeRow, ImportantDate, Enquiry
from .serializers import (AdmissionStepSerializer, FeeRowSerializer,
                          ImportantDateSerializer, EnquirySerializer)


class AdmissionStepViewSet(viewsets.ModelViewSet):
    queryset = AdmissionStep.objects.all()
    serializer_class = AdmissionStepSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class FeeRowViewSet(viewsets.ModelViewSet):
    queryset = FeeRow.objects.all()
    serializer_class = FeeRowSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class ImportantDateViewSet(viewsets.ModelViewSet):
    queryset = ImportantDate.objects.all()
    serializer_class = ImportantDateSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class EnquiryViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffOrSuper()]

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        e = self.get_object()
        e.status = 'read'
        e.save()
        return Response(EnquirySerializer(e).data)

    @action(detail=True, methods=['post'])
    def mark_responded(self, request, pk=None):
        e = self.get_object()
        e.status = 'responded'
        e.save()
        return Response(EnquirySerializer(e).data)
