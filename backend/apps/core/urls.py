from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsView, NavLinkViewSet, SEOMetaViewSet

router = DefaultRouter()
router.register('nav-links', NavLinkViewSet, basename='nav-links')
router.register('seo', SEOMetaViewSet, basename='seo')

urlpatterns = [
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]
