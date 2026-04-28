from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HeroView, StatViewSet, TestimonialViewSet

router = DefaultRouter()
router.register('stats', StatViewSet, basename='stats')
router.register('testimonials', TestimonialViewSet, basename='testimonials')

urlpatterns = [
    path('hero/', HeroView.as_view(), name='hero'),
    path('', include(router.urls)),
]
