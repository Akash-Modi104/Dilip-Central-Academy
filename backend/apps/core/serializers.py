from rest_framework import serializers
from .models import SiteSettings, NavLink, SEOMeta


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'


class NavLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavLink
        fields = '__all__'


class SEOMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOMeta
        fields = '__all__'
