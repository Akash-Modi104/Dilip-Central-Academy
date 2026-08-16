from django.db import models


class SiteContent(models.Model):
    """Versioned JSON document edited by the prospectus-based Admin Studio."""

    key = models.CharField(max_length=60, unique=True, default='main')
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key


class StudioGalleryUpload(models.Model):
    title = models.CharField(max_length=160)
    image = models.ImageField(upload_to='gallery/%Y/%m/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
