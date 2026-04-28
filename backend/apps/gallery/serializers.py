from rest_framework import serializers
from .models import Album, Photo


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = '__all__'


class AlbumSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    photo_count = serializers.IntegerField(source='photos.count', read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'name', 'slug', 'description', 'cover_image',
                  'is_visible', 'order', 'created_at', 'photo_count', 'photos']
