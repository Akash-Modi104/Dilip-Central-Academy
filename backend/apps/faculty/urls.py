from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (FacultyProfileViewSet, CoreValueViewSet,
                    PrincipalMessageView, AboutContentView)

router = DefaultRouter()
router.register('profiles', FacultyProfileViewSet, basename='faculty-profiles')
router.register('core-values', CoreValueViewSet, basename='core-values')

urlpatterns = [
    path('principal-message/', PrincipalMessageView.as_view(), name='principal-message'),
    path('about/', AboutContentView.as_view(), name='about-content'),
    path('', include(router.urls)),
]
