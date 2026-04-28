from rest_framework.routers import DefaultRouter
from .views import AlbumViewSet, PhotoViewSet

router = DefaultRouter()
router.register('albums', AlbumViewSet, basename='albums')
router.register('photos', PhotoViewSet, basename='photos')
urlpatterns = router.urls
