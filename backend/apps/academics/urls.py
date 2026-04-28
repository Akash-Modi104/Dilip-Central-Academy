from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, TimetableViewSet, StudyMaterialViewSet

router = DefaultRouter()
router.register('programs', ProgramViewSet, basename='programs')
router.register('timetables', TimetableViewSet, basename='timetables')
router.register('materials', StudyMaterialViewSet, basename='materials')
urlpatterns = router.urls
