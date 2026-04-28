from django.db import models


class SiteSettings(models.Model):
    """Singleton model for global site settings."""
    school_name = models.CharField(max_length=200, default='Dilip Central Academy')
    tagline = models.CharField(max_length=300, blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    logo = models.ImageField(upload_to='site/', blank=True, null=True)
    favicon = models.ImageField(upload_to='site/', blank=True, null=True)

    primary_color = models.CharField(max_length=20, default='#0d47a1')
    accent_color = models.CharField(max_length=20, default='#ffb300')

    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    map_embed_url = models.URLField(blank=True)
    office_hours = models.CharField(max_length=200, blank=True)

    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.school_name


class NavLink(models.Model):
    label = models.CharField(max_length=80)
    url = models.CharField(max_length=300)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    open_in_new_tab = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.label


class SEOMeta(models.Model):
    page_key = models.SlugField(unique=True, help_text='e.g. home, about, academics')
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=300, blank=True)
    keywords = models.CharField(max_length=300, blank=True)

    def __str__(self):
        return self.page_key
