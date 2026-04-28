from django.db import models
from django.conf import settings


class FacultyProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='faculty_profile', null=True, blank=True)
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=160, blank=True)
    subject = models.CharField(max_length=160, blank=True)
    photo = models.ImageField(upload_to='faculty/', blank=True, null=True)
    bio = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    is_highlighted = models.BooleanField(default=False, help_text='Show on About page')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class CoreValue(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class PrincipalMessage(models.Model):
    name = models.CharField(max_length=200)
    photo = models.ImageField(upload_to='principal/', blank=True, null=True)
    designation = models.CharField(max_length=160, default='Principal')
    message = models.TextField(help_text='Rich-text HTML allowed')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Principal's Message"
        verbose_name_plural = "Principal's Message"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1, defaults={'name': 'Principal', 'message': ''})
        return obj


class AboutContent(models.Model):
    history = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    mission = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    vision = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'About Content'
        verbose_name_plural = 'About Content'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
