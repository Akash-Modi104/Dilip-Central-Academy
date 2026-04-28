from rest_framework.routers import DefaultRouter
from .views import ContactSubmissionViewSet

router = DefaultRouter()
router.register('submissions', ContactSubmissionViewSet, basename='contact-submissions')
urlpatterns = router.urls
