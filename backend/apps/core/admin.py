from django.contrib import admin
from .models import SiteSettings, NavLink, SEOMeta

admin.site.register(SiteSettings)
admin.site.register(NavLink)
admin.site.register(SEOMeta)
