from django.db import models


class Hero(models.Model):
    headline = models.CharField(max_length=200)
    subtext = models.TextField(blank=True)
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True)
    cta_primary_label = models.CharField(max_length=80, blank=True)
    cta_primary_url = models.CharField(max_length=300, blank=True)
    cta_secondary_label = models.CharField(max_length=80, blank=True)
    cta_secondary_url = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    show_stats = models.BooleanField(default=True)
    show_programs = models.BooleanField(default=True)
    show_testimonials = models.BooleanField(default=True)
    show_news = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Hero / Homepage'
        verbose_name_plural = 'Hero / Homepage'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1, defaults={'headline': 'Welcome to Our School'})
        return obj


class Stat(models.Model):
    label = models.CharField(max_length=120)
    value = models.CharField(max_length=40, help_text='e.g. "1,200" or "98%"')
    icon = models.CharField(max_length=80, blank=True, help_text='icon name or class')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f'{self.label}: {self.value}'


class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, blank=True, help_text='e.g. Parent of Grade 8 Student')
    photo = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return self.name
