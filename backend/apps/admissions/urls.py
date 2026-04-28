from rest_framework.routers import DefaultRouter
from .views import (AdmissionStepViewSet, FeeRowViewSet,
                    ImportantDateViewSet, EnquiryViewSet)

router = DefaultRouter()
router.register('steps', AdmissionStepViewSet, basename='steps')
router.register('fees', FeeRowViewSet, basename='fees')
router.register('dates', ImportantDateViewSet, basename='dates')
router.register('enquiries', EnquiryViewSet, basename='enquiries')
urlpatterns = router.urls
