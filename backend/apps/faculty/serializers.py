from rest_framework import serializers
from .models import FacultyProfile, CoreValue, PrincipalMessage, AboutContent


class FacultyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyProfile
        fields = '__all__'


class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = '__all__'


class PrincipalMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrincipalMessage
        fields = '__all__'


class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = '__all__'
