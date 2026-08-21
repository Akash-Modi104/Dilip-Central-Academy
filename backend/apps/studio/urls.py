from django.urls import path

from . import views


urlpatterns = [
    path('health/', views.health, name='studio-health'),
    path('content/', views.site_content, name='studio-content'),
    path('login/', views.login_api, name='studio-login'),
    path('gallery/upload/', views.gallery_upload, name='studio-gallery-upload'),
    path('enquiries/', views.parent_enquiries, name='studio-parent-enquiries'),
    path('enquiries/<int:enquiry_id>/', views.parent_enquiry_detail, name='studio-parent-enquiry-detail'),
]
