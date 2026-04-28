from django.db import models
from django.utils import timezone


class NewsArticle(models.Model):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    STATUS = [(DRAFT, 'Draft'), (PUBLISHED, 'Published')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    tag = models.CharField(max_length=80, blank=True)
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    body = models.TextField(help_text='Rich-text HTML allowed')
    status = models.CharField(max_length=10, choices=STATUS, default=DRAFT)
    publish_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-publish_at']

    def __str__(self):
        return self.title


class Event(models.Model):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    STATUS = [(DRAFT, 'Draft'), (PUBLISHED, 'Published')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    banner = models.ImageField(upload_to='events/', blank=True, null=True)
    venue = models.CharField(max_length=200, blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS, default=DRAFT)

    class Meta:
        ordering = ['-start_at']

    def __str__(self):
        return self.title


class Notice(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField(blank=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return self.title

    @property
    def is_expired(self):
        return bool(self.expires_at and self.expires_at < timezone.now())
