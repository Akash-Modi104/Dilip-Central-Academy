from rest_framework.routers import DefaultRouter
from .views import NewsArticleViewSet, EventViewSet, NoticeViewSet

router = DefaultRouter()
router.register('articles', NewsArticleViewSet, basename='articles')
router.register('events', EventViewSet, basename='events')
router.register('notices', NoticeViewSet, basename='notices')
urlpatterns = router.urls
