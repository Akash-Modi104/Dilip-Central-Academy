from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import CustomLoginView

api_v1 = [
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', include('apps.users.urls')),
    path('site/', include('apps.core.urls')),
    path('homepage/', include('apps.homepage.urls')),
    path('academics/', include('apps.academics.urls')),
    path('news/', include('apps.news.urls')),
    path('gallery/', include('apps.gallery.urls')),
    path('admissions/', include('apps.admissions.urls')),
    path('contact/', include('apps.contact.urls')),
    path('faculty/', include('apps.faculty.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
