from rest_framework import viewsets
from apps.permissions import ReadOnlyOrStaff
from .models import Album, Photo
from .serializers import AlbumSerializer, PhotoSerializer


class AlbumViewSet(viewsets.ModelViewSet):
    serializer_class = AlbumSerializer
    permission_classes = [ReadOnlyOrStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        u = self.request.user
        qs = Album.objects.all()
        if not (u.is_authenticated and u.role in ('super_admin', 'staff')):
            qs = qs.filter(is_visible=True)
        return qs


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [ReadOnlyOrStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        album = self.request.query_params.get('album')
        if album:
            qs = qs.filter(album_id=album)
        return qs
