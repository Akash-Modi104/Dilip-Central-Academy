from django.db import models
from django.conf import settings


class Program(models.Model):
    title = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    curriculum = models.TextField(blank=True, help_text='Rich-text HTML allowed')
    icon = models.CharField(max_length=80, blank=True)
    image = models.ImageField(upload_to='programs/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class Timetable(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='timetables')
    title = models.CharField(max_length=160, help_text='e.g. "Term 1 — 2026"')
    file = models.FileField(upload_to='timetables/', blank=True, null=True)
    structured_data = models.TextField(blank=True,
        help_text='Optional JSON schedule string, e.g. {"Mon":[{"period":1,"subject":"Math"}]}')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.program.title} — {self.title}'


class StudyMaterial(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='materials')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='materials/')
    is_published = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title
