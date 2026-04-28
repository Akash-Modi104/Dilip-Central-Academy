from rest_framework import viewsets, permissions

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

    def get_queryset(self):
        qs = Enquiry.objects.all()
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsStaffOrSuper()]
