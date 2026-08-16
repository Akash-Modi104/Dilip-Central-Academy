from django.contrib import admin

from .models import SiteContent, StudioGalleryUpload


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')
    readonly_fields = ('updated_at',)


@admin.register(StudioGalleryUpload)
class StudioGalleryUploadAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    readonly_fields = ('created_at',)
