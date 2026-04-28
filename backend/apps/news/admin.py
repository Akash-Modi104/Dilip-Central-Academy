from django.contrib import admin
from .models import NewsArticle, Event, Notice

admin.site.register(NewsArticle)
admin.site.register(Event)
admin.site.register(Notice)
