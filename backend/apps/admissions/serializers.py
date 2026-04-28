from rest_framework import serializers
from .models import AdmissionStep, FeeRow, ImportantDate, Enquiry


class AdmissionStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionStep
        fields = '__all__'


class FeeRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeRow
        fields = '__all__'


class ImportantDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantDate
        fields = '__all__'


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'
        read_only_fields = ['created_at']
