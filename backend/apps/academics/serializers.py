from rest_framework import serializers
from .models import Program, Timetable, StudyMaterial


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = '__all__'


class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'


class StudyMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = StudyMaterial
        fields = ['id', 'program', 'uploaded_by', 'uploaded_by_name',
                  'title', 'description', 'file', 'is_published', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_by_name', 'uploaded_at']
