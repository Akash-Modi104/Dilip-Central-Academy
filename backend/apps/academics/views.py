from rest_framework import viewsets, permissions
from rest_framework.permissions import SAFE_METHODS

from apps.permissions import ReadOnlyOrSuperAdmin, IsTeacherOrSuper
from .models import Program, Timetable, StudyMaterial
from .serializers import ProgramSerializer, TimetableSerializer, StudyMaterialSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]
    lookup_field = 'slug'


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [ReadOnlyOrSuperAdmin]


class StudyMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudyMaterial.objects.filter(is_published=True)
    serializer_class = StudyMaterialSerializer

    def get_queryset(self):
        qs = StudyMaterial.objects.all()
        u = self.request.user
        if not (u.is_authenticated and u.role in ('super_admin', 'teacher')):
            qs = qs.filter(is_published=True)
        program = self.request.query_params.get('program')
        if program:
            qs = qs.filter(program_id=program)
        return qs.order_by('-uploaded_at')

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsTeacherOrSuper()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        u = self.request.user
        instance = self.get_object()
        if u.role == 'teacher' and instance.uploaded_by_id != u.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Teachers can only edit their own materials.')
        serializer.save()
